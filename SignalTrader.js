var variablePath = "C:\\Users\\Damjan\\Documents\\GitHub\\qt-bitcoin-trader-scripts-signal-trading\\";
var signal1StatusFile = variablePath + "\\BTC\\signal1Status.txt";
var signal2StatusFile = variablePath + "\\BTC\\signal2Status.txt";
var signal1Status = "";
var signal2Status = "";
var signal1StatusOld = "";
var signal2StatusOld = "";
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
var minSecondaryCurrencyBalanceForSale = 0.001;
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


//////////////////////////////////////////////////////////////////////////////////////////////

function readSignalFiles() {
    var scriptName = "readSignalFiles()";
    eventLogger(scriptName + ".START");

    signal1Status = trader.fileReadAll(signal1StatusFile).toString().trim();    
    signal2Status = trader.fileReadAll(signal2StatusFile).toString().trim();
    

    eventLogger(scriptName + ".signal1Status: " + signal1Status);    
    eventLogger(scriptName + ".signal2Status: " + signal2Status);    

    //signalCorrection();

    signal1StatusOld = signal1Status;    
    signal2StatusOld = signal2Status;
    
    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function executeBuy() {
    var scriptName = "executeBuy()";
    eventLogger(scriptName + ".START");

    eventLogger(scriptName + ".STEP 1");
    var lastCurrencyPrimaryBalance = trader.get("Balance", currencyPrimary);
    var lastCurrencySecondaryBalance = trader.get("Balance", currencySecondary);
    eventLogger(scriptName + ".lastCurrencyPrimaryBalance: " + lastCurrencyPrimaryBalance);
    eventLogger(scriptName + ".minPrimaryCurrencyBalanceForSale: " + minPrimaryCurrencyBalanceForSale);

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

            trader.buy(currencySecondary + currencyPrimary, buyAmount, lastPrice);
        }
        resetSignalSellFilesStatus();
        executeBid = true;
    }
    resetSignalBuyFilesStatus();

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeBuy() {
    var scriptName = "makeBuy()";
    eventLogger(scriptName + ".START");

    readSignalFiles();

    if (canMakeBuy()) {
        trader.cancelBids(currencySecondary + currencyPrimary);
        trader.delay(5, "executeBuy()");
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

    eventLogger(scriptName + ".signal2Status: " + signal2Status);
    
    if (signal2Status == "TRUE") {
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

    var lastCurrencyPrimaryBalance = trader.get("Balance", currencyPrimary);

    eventLogger(scriptName + ".lastCurrencyPrimaryBalance: " + lastCurrencyPrimaryBalance);
    eventLogger(scriptName + ".minPrimaryCurrencyBalanceForSale: " + minPrimaryCurrencyBalanceForSale);

    if (executeAsk == true && lastCurrencySecondaryBalance < minSecondaryCurrencyBalanceForSale && openAsks == 0 && lastCurrencyPrimaryBalance > minPrimaryCurrencyBalanceForSale) {
        eventLogger(scriptName + ".STEP 4");
        executeBid = false;
        executeAsk = false;
        lastSellPrice = trader.get("LastMySellPrice");
        return false;
    }

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function executeSell() {
    var scriptName = "executeSell()";
    eventLogger(scriptName + ".START");

    eventLogger(scriptName + ".STEP 1");
    var lastCurrencyPrimaryBalance = trader.get("Balance", currencyPrimary);
    var lastCurrencySecondaryBalance = trader.get("Balance", currencySecondary);

    eventLogger(scriptName + ".lastCurrencySecondaryBalance: " + lastCurrencySecondaryBalance);
    eventLogger(scriptName + ".minSecondaryCurrencyBalanceForSale: " + minSecondaryCurrencyBalanceForSale);

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

            trader.sell(currencySecondary + currencyPrimary, sellAmount, lastPrice);
        }
        resetSignalBuyFilesStatus();
        executeAsk = true;
    }
    resetSignalSellFilesStatus();

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function makeSell() {
    var scriptName = "makeSell()";
    eventLogger(scriptName + ".START");
    readSignalFiles();
    if (canMakeSell()) {
        trader.cancelAsks(currencySecondary + currencyPrimary);
        trader.delay(5, "executeSell()");
    }
    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resetSignalBuyFilesStatus() {
    var scriptName = "resetSignalBuyFilesStatus()";
    eventLogger(scriptName + ".START");

    trader.fileWrite(signal1StatusFile, "FALSE");    

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////

function resetSignalSellFilesStatus() {
    var scriptName = "resetSignalSellFilesStatus()";
    eventLogger(scriptName + ".START");

    trader.fileWrite(signal2StatusFile, "FALSE");    

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
    
    if (signal1Status == "TRUE") {
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

    var lastCurrencySecondaryBalance = trader.get("Balance", currencySecondary);
    eventLogger(scriptName + ".lastCurrencySecondaryBalance: " + lastCurrencySecondaryBalance);
    eventLogger(scriptName + ".minSecondaryCurrencyBalanceForSale: " + minSecondaryCurrencyBalanceForSale);

    if (executeBid == true && lastCurrencyPrimaryBalance < minPrimaryCurrencyBalanceForSale && openBids == 0 && lastCurrencySecondaryBalance > minSecondaryCurrencyBalanceForSale) {
        eventLogger(scriptName + ".STEP 4");
        executeBid = false;
        executeAsk = false;
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

    makeBuy();
    makeSell();

    eventLogger(scriptName + ".END --------------------------------------");
}

//////////////////////////////////////////////////////////////////////////////////////////////
///////////////                      main program                          ///////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

trader.timer(30, "startEverything()");
trader.timer(15, "checkTradeExecutionCondition()");