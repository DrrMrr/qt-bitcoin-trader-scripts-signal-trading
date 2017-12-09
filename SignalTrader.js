var variablePath = "C:\\Users\\Damjan\\Documents\\GitHub\\qt-bitcoin-trader-scripts-signal-trading\\";
var signal1StatusFile = variablePath + "Signal1Status.txt";
var signal2StatusFile = variablePath + "Signal2Status.txt";
var signal3StatusFile = variablePath + "Signal3Status.txt";
var signal4StatusFile = variablePath + "Signal4Status.txt";
var signal1Status = "";
var signal2Status = "";
var signal3Status = "";
var signal4Status = "";
var signal1StatusOld = "";
var signal2StatusOld = "";
var signal3StatusOld = "";
var signal4StatusOld = "";
var lastBuyPriceFile = variablePath + "lastBuyPrice.txt";
var lastSellPriceFile = variablePath + "lastSellPrice.txt";
var lastBuyPrice = 0;
var lastBuyPriceOld = 0;
var lastSellPrice = 0;
var lastSellPriceOld = 0;
var currencyPrimary = "USD";
var currencySecondary = "BTC";
var feeMaker = 0.001;
var feeTaker = 0.002;
var openAsksCountOld = 0;
var openBidsCountOld = 0;
var minPrimaryCurrencyBalanceForSale = 100;
var minSecondaryCurrencyBalanceForSale = 0.01;
var executeAsk = false;
var executeBid = false;
var lastCurrencySecondaryBalanceRight = 0;
trader.fileWrite(lastSellPriceFile, lastSellPrice);
trader.fileWrite(lastSellPriceFile, lastSellPrice);

//////////////////////////////////////////////////////////////////////////////////////////////
///////////////                  log to file or window                     ///////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
var logToFile = true;
var logToWindow = true;
var logFile = variablePath + "SignalTraderLogger.txt";

function eventLogger(tempString) {
    if (logToFile)
        trader.fileAppend(logFile, trader.dateTimeString() + ": " + tempString);
    if (logToWindow)
        trader.log(tempString);
}
//////////////////////////////////////////////////////////////////////////////////////////////
///////////////                       functions                            ///////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

function checkTradeExecutionCondition() {
    var scriptName = "checkTradeExecutionCondition()";
    eventLogger(scriptName + ".START");

    eventLogger(scriptName + ".executeAsk: " + executeAsk);
    eventLogger(scriptName + ".executeBid: " + executeBid);
    if (executeAsk == true) {
        makeSell();
    }

    if (executeBid == true) {
        makeBuy();
    }

    eventLogger(scriptName + ".END");
}

function signalCorrection() {
    var scriptName = "signalCorrection()";
    eventLogger(scriptName + ".START");

    if(signal1Status != signal1StatusOld && signal1Status == "TRUE")
    {
       signal3Status = "FALSE";
       trader.fileWrite(signal3StatusFile, "FALSE");
       eventLogger(scriptName + ".signal3Status: " + signal3Status); 
    }
    if(signal2Status != signal2StatusOld && signal2Status == "TRUE")
    {
       signal4Status = "FALSE"; 
       trader.fileWrite(signal4StatusFile, "FALSE");
       eventLogger(scriptName + ".signal4Status: " + signal4Status); 
    }
    if(signal3Status != signal3StatusOld && signal3Status == "TRUE")
    {
       signal1Status = "FALSE"; 
       trader.fileWrite(signal1StatusFile, "FALSE");
       eventLogger(scriptName + ".signal1Status: " + signal1Status); 
    }
    if(signal4Status != signal4StatusOld && signal4Status == "TRUE")
    {
       signal2Status = "FALSE";
       trader.fileWrite(signal2StatusFile, "FALSE"); 
       eventLogger(scriptName + ".signal2Status: " + signal2Status);
    }

    eventLogger(scriptName + ".END");
}

function readSignalFiles() {
    var scriptName = "readSignalFiles()";
    eventLogger(scriptName + ".START");

    signal1Status = trader.fileReadAll(signal1StatusFile).toString().trim();
    signal2Status = trader.fileReadAll(signal2StatusFile).toString().trim();
    signal3Status = trader.fileReadAll(signal3StatusFile).toString().trim();
    signal4Status = trader.fileReadAll(signal4StatusFile).toString().trim();

    eventLogger(scriptName + ".signal1Status: " + signal1Status);
    eventLogger(scriptName + ".signal2Status: " + signal2Status);
    eventLogger(scriptName + ".signal3Status: " + signal3Status);
    eventLogger(scriptName + ".signal4Status: " + signal4Status);

    signalCorrection();

    signal1StatusOld = signal1Status;
    signal2StatusOld = signal2Status;
    signal3StatusOld = signal3Status;
    signal4StatusOld = signal4Status;

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeBuy() {
    var scriptName = "makeBuy()";
    eventLogger(scriptName + ".START");

    readSignalFiles();

    if (canMakeBuy()) {
        eventLogger(scriptName + ".STEP 1");
        var lastCurrencyPrimaryBalance = trader.get("Balance", currencyPrimary);
        var lastCurrencySecondaryBalance = trader.get("Balance", currencySecondary);
        eventLogger(scriptName + ".lastCurrencyPrimaryBalance: " + lastCurrencyPrimaryBalance);
        trader.cancelBids(currencySecondary + currencyPrimary);
        if (lastCurrencyPrimaryBalance > minPrimaryCurrencyBalanceForSale) {
            eventLogger(scriptName + ".lastCurrencySecondaryBalance: " + lastCurrencySecondaryBalance);
            eventLogger(scriptName + ".lastSellPrice: " + lastSellPrice);
            lastBuyPrice = trader.get("LastMyBuyPrice");
            eventLogger(scriptName + ".lastBuyPrice: " + lastBuyPrice);
            var lastPrice = trader.get("LastPrice");
            eventLogger(scriptName + ".lastPrice: " + lastPrice);
            var buyAmount = lastCurrencyPrimaryBalance / lastPrice;
            buyAmount = buyAmount - 0.0001;
            eventLogger(scriptName + ".buyAmount: " + buyAmount);

            if (lastSellPrice == 0) {
                trader.buy(currencySecondary + currencyPrimary, buyAmount, lastPrice);
            } else {
                lastSellPrice = trader.get("LastMySellPrice");
                eventLogger(scriptName + ".lastSellPrice: " + lastSellPrice);
                var primaryBalanceBeforeLastSell = lastSellPrice / ((1 - feeTaker) * 1000) * 1000;
                eventLogger(scriptName + ".primaryBalanceBeforeLastSell: " + primaryBalanceBeforeLastSell);
                var primaryBalanceOnePromile = primaryBalanceBeforeLastSell / ((1 - feeTaker) * 1000);
                eventLogger(scriptName + ".primaryBalanceOnePromile: " + primaryBalanceOnePromile);
                var newWantedPrimaryBalance = primaryBalanceOnePromile * 1000 + primaryBalanceOnePromile * feeMaker * 1000;
                eventLogger(scriptName + ".newWantedPrimaryBalance: " + newWantedPrimaryBalance);

                var buyPrice = newWantedPrimaryBalance;
                eventLogger(scriptName + ".lastCurrencySecondaryBalance: " + lastCurrencySecondaryBalance);
                eventLogger(scriptName + ".buyPrice: " + buyPrice);
                /*
                if (lastPrice < buyPrice || buyPrice > lastSellPrice)
                    trader.buy(currencySecondary + currencyPrimary, buyAmount, lastPrice);
                else
                    trader.buy(currencySecondary + currencyPrimary, buyAmount, buyPrice);
                */
                trader.buy(currencySecondary + currencyPrimary, buyAmount, lastPrice);
            }
            resetSignalSellFilesStatus();
            executeBid = true;
        }
        resetSignalBuyFilesStatus();
    }

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function canMakeSell() {
    var scriptName = "canMakeSell()";
    eventLogger(scriptName + ".START");

    var makeSellCondition = false;
    var openAsks = trader.get("OpenAsksCount");
    eventLogger(scriptName + ".openAsks: " + openAsks);
    if (openAsks > 0) {
        eventLogger(scriptName + ".STEP 1");
        return true;
    }

    eventLogger(scriptName + ".signal3Status: " + signal3Status);
    eventLogger(scriptName + ".signal4Status: " + signal4Status);

    if (signal3Status == "TRUE" && signal4Status == "TRUE") {
        eventLogger(scriptName + ".STEP 2");
        return true;
    }

    var lastCurrencySecondaryBalance = trader.get("Balance", currencySecondary);
    eventLogger(scriptName + ".lastCurrencySecondaryBalance: " + lastCurrencySecondaryBalance);
    eventLogger(scriptName + ".executeAsk: " + executeAsk);
    if (executeAsk == true && lastCurrencySecondaryBalance > minSecondaryCurrencyBalanceForSale) {
        eventLogger(scriptName + ".STEP 3");
        return true;
    }

    if (executeAsk == true && lastCurrencySecondaryBalance < minSecondaryCurrencyBalanceForSale && openAsks == 0) {
        eventLogger(scriptName + ".STEP 4");
        executeAsk = false;
        lastSellPrice = trader.get("LastMySellPrice");
        return false;
    }

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeSell() {
    var scriptName = "makeSell()";
    eventLogger(scriptName + ".START");
    readSignalFiles();
    if (canMakeSell()) {
        eventLogger(scriptName + ".STEP 1");
        var lastCurrencyPrimaryBalance = trader.get("Balance", currencyPrimary);
        var lastCurrencySecondaryBalance = trader.get("Balance", currencySecondary);
        trader.cancelAsks(currencySecondary + currencyPrimary);
        eventLogger(scriptName + ".lastCurrencyPrimaryBalance: " + lastCurrencyPrimaryBalance);

        if (lastCurrencySecondaryBalance > minSecondaryCurrencyBalanceForSale) {
            eventLogger(scriptName + ".lastBuyPrice: " + lastBuyPrice);
            lastSellPrice = trader.get("LastMySellPrice");
            eventLogger(scriptName + ".lastSellPrice: " + lastSellPrice);
            eventLogger(scriptName + ".lastCurrencySecondaryBalance: " + lastCurrencySecondaryBalance);
            var lastPrice = trader.get("LastPrice");
            eventLogger(scriptName + ".lastPrice: " + lastPrice);
            var sellAmount = lastCurrencySecondaryBalance;
            sellAmount = sellAmount - 0.0001;
            eventLogger(scriptName + ".sellAmount: " + sellAmount);

            if (lastBuyPrice == 0) {
                eventLogger(scriptName + ".lastBuyPrice == 0");
                trader.sell(currencySecondary + currencyPrimary, sellAmount, lastPrice);
            } else {
                lastBuyPrice = trader.get("LastMyBuyPrice");
                eventLogger(scriptName + ".lastBuyPrice: " + lastBuyPrice);
                var primaryBalanceBeforeLastBuy = lastBuyPrice / ((1 - feeMaker) * 1000) * 1000;
                eventLogger(scriptName + ".primaryBalanceBeforeLastBuy: " + primaryBalanceBeforeLastBuy);
                var primaryBalanceOnePromile = primaryBalanceBeforeLastBuy / ((1 - feeMaker) * 1000);
                eventLogger(scriptName + ".primaryBalanceOnePromile: " + primaryBalanceOnePromile);
                var newWantedPrimaryBalance = primaryBalanceOnePromile * 1000 + primaryBalanceOnePromile * feeTaker * 1000;
                eventLogger(scriptName + ".newWantedPrimaryBalance: " + newWantedPrimaryBalance);
                var sellPrice = newWantedPrimaryBalance;

                eventLogger(scriptName + ".lastCurrencySecondaryBalance: " + lastCurrencySecondaryBalance);
                eventLogger(scriptName + ".lastPrice: " + lastPrice);
                eventLogger(scriptName + ".sellPrice: " + sellPrice);

                /*
                if (lastPrice > sellPrice || sellPrice < lastBuyPrice)
                {
                    eventLogger(scriptName + ".SELL at lastPrice");
                    trader.sell(currencySecondary + currencyPrimary, sellAmount, lastPrice);
                }
                else
                    eventLogger(scriptName + ".SELL at sellPrice");
                    trader.sell(currencySecondary + currencyPrimary, sellAmount, sellPrice);
                }*/
                trader.sell(currencySecondary + currencyPrimary, sellAmount, lastPrice);
            }
            resetSignalBuyFilesStatus();
            executeAsk = true;
        }
        resetSignalSellFilesStatus();
    }
    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resetSignalBuyFilesStatus() {
    var scriptName = "resetSignalBuyFilesStatus()";
    eventLogger(scriptName + ".START");

    trader.fileWrite(signal1StatusFile, "FALSE");
    trader.fileWrite(signal2StatusFile, "FALSE");

    eventLogger(scriptName + ".END");
}

function resetSignalSellFilesStatus() {
    var scriptName = "resetSignalSellFilesStatus()";
    eventLogger(scriptName + ".START");

    trader.fileWrite(signal3StatusFile, "FALSE");
    trader.fileWrite(signal4StatusFile, "FALSE");

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function canMakeBuy() {
    var scriptName = "canMakeBuy()";
    eventLogger(scriptName + ".START");

    var makeBuyCondition = false;
    var openBids = trader.get("OpenBidsCount");
    eventLogger(scriptName + ".openBids: " + openBids);

    if (openBids > 0) {
        eventLogger(scriptName + ".STEP 1");
        return true;
    }


    eventLogger(scriptName + ".signal1Status: " + signal1Status);
    eventLogger(scriptName + ".signal2Status: " + signal2Status);
    if (signal1Status == "TRUE" && signal2Status == "TRUE") {
        eventLogger(scriptName + ".STEP 2");
        return true;
    }

    var lastCurrencyPrimaryBalance = trader.get("Balance", currencyPrimary);
    eventLogger(scriptName + ".lastCurrencyPrimaryBalance: " + lastCurrencyPrimaryBalance);
    eventLogger(scriptName + ".executeBid: " + executeBid);
    if (executeBid == true && lastCurrencyPrimaryBalance > minPrimaryCurrencyBalanceForSale) {
        eventLogger(scriptName + ".STEP 3");
        return true;
    }

    if (executeBid == true && lastCurrencyPrimaryBalance < minPrimaryCurrencyBalanceForSale && openBids == 0) {
        eventLogger(scriptName + ".STEP 4");
        executeBid = false;
        lastBuyPrice = trader.get("LastMyBuyPrice");
        return false;
    }

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function writeLastBuyPrice() {
    var scriptName = "writeLastBuyPrice()";
    eventLogger(scriptName + ".START");

    lastBuyPrice = trader.get("LastMyBuyPrice");
    eventLogger(scriptName + ".lastBuyPrice: " + lastBuyPrice);
    trader.fileWrite(lastBuyPriceFile, lastBuyPrice);

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function readLastBuyPrice() {
    var scriptName = "readLastBuyPrice()";
    eventLogger(scriptName + ".START");

    lastBuyPrice = parseFloat(trader.fileReadAll(lastBuyPriceFile).toString().trim());
    eventLogger(scriptName + ".lastBuyPrice: " + lastBuyPrice);
    if (lastBuyPrice != 0) {
        lastBuyPrice = trader.get("LastMyBuyPrice");
        eventLogger(scriptName + ".lastBuyPrice: " + lastBuyPrice);
    }
    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function writeLastSellPrice() {
    var scriptName = "writeLastSellPrice()";
    eventLogger(scriptName + ".START");

    lastSellPrice = trader.get("LastMySellPrice");
    eventLogger(scriptName + ".lastSellPrice: " + lastSellPrice);
    trader.fileWrite(lastSellPriceFile, lastSellPrice);

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function readLastSellPrice() {
    var scriptName = "readLastSellPrice()";
    eventLogger(scriptName + ".START");

    lastSellPrice = parseFloat(trader.fileReadAll(lastSellPriceFile).toString().trim());
    eventLogger(scriptName + ".lastSellPrice: " + lastSellPrice);
    if (lastSellPrice != 0) {
        lastSellPrice = trader.get("LastMySellPrice");
        eventLogger(scriptName + ".lastSellPrice: " + lastSellPrice);
    }

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function compareLastBuyPrice() {
    var scriptName = "compareLastBuyPrice()";
    eventLogger(scriptName + ".START");

    if (lastBuyPrice != 0) {
        lastBuyPrice = trader.get("LastMyBuyPrice");
        if (lastBuyPrice != lastBuyPriceOld) {
            resetSignalBuyFilesStatus();
            lastBuyPriceOld = lastBuyPrice;
            writeLastBuyPrice();
        }
    }

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function compareLastSellPrice() {
    var scriptName = "compareLastSellPrice()";
    eventLogger(scriptName + ".START");

    if (lastSellPrice != 0) {
        lastSellPrice = trader.get("LastMySellPrice");
        if (lastSellPrice != lastSellPriceOld) {
            resetSignalSellFilesStatus();
            lastSellPriceOld = lastSellPrice;
            writeLastSellPrice();
        }
    }


    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function startEverything() {
    var scriptName = "startEverything()";
    eventLogger(scriptName + ".START --------------------------------------");

    readSignalFiles();

    eventLogger(scriptName + ".lastBuyPrice: " + lastBuyPrice);
    if (lastBuyPrice == 0) {
        readLastBuyPrice();
    }

    eventLogger(scriptName + ".lastSellPrice: " + lastSellPrice);
    if (lastSellPrice == 0) {
        readLastSellPrice();
    }

    compareLastBuyPrice();
    compareLastSellPrice();

    makeSell();
    makeBuy();

    eventLogger(scriptName + ".END --------------------------------------");
}

//////////////////////////////////////////////////////////////////////////////////////////////
///////////////                      main program                          ///////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

trader.timer(30, "startEverything()");
trader.timer(10, "checkTradeExecutionCondition()");

///////////// Optional /////////////////
/*
var executed=false;
function executeRule()
{
 executed=true;
 trader.playWav("C:\Windows\Media\Ring04.wav");
 trader.groupDone();
}

trader.on("MyLastTrade").changed()
{
 if(executed)return;
 if(symbol != "BTCUSDexchange")return;
 executeRule();
}
*/