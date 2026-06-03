//+------------------------------------------------------------------+
//|  JurnalEA.mq5  —  Trading Journal Auto-Import                    |
//|  Har trade yopilganda jurnal.com/api/mt5/webhook ga JSON yuboradi |
//+------------------------------------------------------------------+
#property copyright "Trading Journal"
#property version   "1.00"
#property strict

//--- Input parametrlari
input string WebhookURL = "https://YOUR-SITE.com/api/mt5/webhook"; // Webhook URL
input string ApiKey     = "PASTE-YOUR-API-KEY-HERE";               // API Key
input bool   SendOnOpen = false; // Ochilgan tradelarniyam yuborsinmi?

//--- Oxirgi import qilingan ticket lar (dublikat oldini olish)
#include <Arrays\ArrayLong.mqh>
CArrayLong g_sentTickets;

//+------------------------------------------------------------------+
int OnInit()
{
   Print("[JurnalEA] Started. Webhook: ", WebhookURL);
   if(StringLen(ApiKey) < 10 || StringFind(ApiKey, "PASTE") >= 0)
   {
      Alert("[JurnalEA] API Key kiritilmagan! EA ishlamaydi.");
      return INIT_FAILED;
   }
   // WebRequest uchun URL ni MT5 Options ga qo'shish kerak
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason) { }

//+------------------------------------------------------------------+
// Har trade holati o'zgarganda chaqiriladi
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest    &request,
                        const MqlTradeResult     &result)
{
   // Faqat deal DEAL_ENTRY_OUT (yopilgan) yoki IN_OUT (reversal) da ishlaymiz
   if(trans.type != TRADE_TRANSACTION_DEAL_ADD) return;

   ulong dealTicket = trans.deal;
   if(dealTicket == 0) return;

   // Deal ma'lumotlarini olamiz
   if(!HistoryDealSelect(dealTicket)) return;

   ENUM_DEAL_ENTRY entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(dealTicket, DEAL_ENTRY);

   // Faqat yopilgan yoki reversal deallarni olish
   bool isClose    = (entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_INOUT);
   bool isOpen     = (entry == DEAL_ENTRY_IN);

   if(!isClose && !(SendOnOpen && isOpen)) return;

   // Dublikat tekshirish
   if(g_sentTickets.SearchLinear(dealTicket) >= 0) return;

   // Ma'lumotlarni yig'amiz
   string symbol     = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
   double volume     = HistoryDealGetDouble(dealTicket, DEAL_VOLUME);
   double price      = HistoryDealGetDouble(dealTicket, DEAL_PRICE);
   double profit     = HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
   double swap       = HistoryDealGetDouble(dealTicket, DEAL_SWAP);
   double commission = HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);
   string comment    = HistoryDealGetString(dealTicket, DEAL_COMMENT);
   long   magic      = HistoryDealGetInteger(dealTicket, DEAL_MAGIC);
   long   dealTime   = HistoryDealGetInteger(dealTicket, DEAL_TIME);
   ENUM_DEAL_TYPE dealType = (ENUM_DEAL_TYPE)HistoryDealGetInteger(dealTicket, DEAL_TYPE);
   long   posId      = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);

   // Pozitsiya tarixidan entry ma'lumotini topamiz
   double openPrice  = 0;
   datetime openTime = 0;
   string tradeType  = "buy";

   if(HistorySelectByPosition(posId))
   {
      int total = HistoryDealsTotal();
      for(int i = 0; i < total; i++)
      {
         ulong dTicket = HistoryDealGetTicket(i);
         ENUM_DEAL_ENTRY dEntry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(dTicket, DEAL_ENTRY);
         if(dEntry == DEAL_ENTRY_IN)
         {
            openPrice = HistoryDealGetDouble(dTicket, DEAL_PRICE);
            openTime  = (datetime)HistoryDealGetInteger(dTicket, DEAL_TIME);
            ENUM_DEAL_TYPE dType = (ENUM_DEAL_TYPE)HistoryDealGetInteger(dTicket, DEAL_TYPE);
            tradeType = (dType == DEAL_TYPE_BUY) ? "buy" : "sell";
            break;
         }
      }
   }

   if(openPrice == 0) openPrice = price; // fallback

   // Vaqtni ISO formatga o'tkazish
   string closeTimeStr = TimeToString((datetime)dealTime, TIME_DATE | TIME_SECONDS);
   string openTimeStr  = TimeToString(openTime, TIME_DATE | TIME_SECONDS);
   // TimeToString "2026.06.02 14:30:00" beradi — biz shunday yuborsak ham server normalise qiladi

   // JSON body yasaymiz
   string json = StringFormat(
      "{"
         "\"ticket\":%I64d,"
         "\"symbol\":\"%s\","
         "\"type\":\"%s\","
         "\"volume\":%.2f,"
         "\"open_price\":%.5f,"
         "\"close_price\":%.5f,"
         "\"open_time\":\"%s\","
         "\"close_time\":\"%s\","
         "\"profit\":%.2f,"
         "\"swap\":%.2f,"
         "\"commission\":%.2f,"
         "\"comment\":\"%s\","
         "\"magic\":%I64d"
      "}",
      (long)posId,
      symbol,
      tradeType,
      volume,
      openPrice,
      price,
      openTimeStr,
      closeTimeStr,
      profit,
      swap,
      commission,
      comment,
      magic
   );

   // HTTP POST yuborish
   SendWebhook(json, dealTicket);
}

//+------------------------------------------------------------------+
void SendWebhook(string jsonBody, ulong ticket)
{
   char   postData[];
   char   resultData[];
   string resultHeaders;

   StringToCharArray(jsonBody, postData, 0, StringLen(jsonBody));

   string headers = "Content-Type: application/json\r\n"
                    "x-api-key: " + ApiKey + "\r\n";

   int timeout = 5000; // 5 soniya
   int res = WebRequest(
      "POST",
      WebhookURL,
      headers,
      timeout,
      postData,
      resultData,
      resultHeaders
   );

   if(res == 200 || res == 201)
   {
      g_sentTickets.Add(ticket);
      Print("[JurnalEA] Trade imported ✓ ticket=", ticket);
   }
   else if(res == -1)
   {
      Print("[JurnalEA] WebRequest failed. MT5 Options → Expert Advisors → Allow WebRequest for: ", WebhookURL);
   }
   else
   {
      string resp = CharArrayToString(resultData);
      Print("[JurnalEA] Server error ", res, ": ", resp);
   }
}
//+------------------------------------------------------------------+
