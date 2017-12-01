var variablePath = "C:\\Users\\Damjan\\Documents\\GitHub\\qt-bitcoin-trader-scripts-signal-trading\\";
var signal1StatusFile = variablePath + "Signal1Status.txt"; 
var signal2StatusFile = variablePath + "Signal2Status.txt"; 
var signal3StatusFile = variablePath + "Signal3Status.txt"; 
var signal4StatusFile = variablePath + "Signal4Status.txt"; 
var signal1Status = "";
var signal2Status = "";
var signal3Status = "";
var signal4Status = "";
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
            eventLogger(scriptName + ".lastCurrencyPrimaryBalance: " + lastCurrencyPrimaryBalance);
            eventLogger(scriptName + ".lastBuyPrice: " + lastBuyPrice);
            if (lastBuyPrice == 0) {
                lastBuyPrice = trader.get("LastPrice");
            } else {
                lastBuyPrice = trader.get("LastMyBuyPrice");
            }

            eventLogger(scriptName + ".lastBuyPrice: " + lastBuyPrice);
            
            var primaryBalanceBeforeLastSell = lastBuyPrice / ((1 - feeTaker) * 1000) * 1000;
            var secondaryBalanceBeforeLastSell = lastCurrencySecondaryBalance / ((1 - feeTaker) * 1000) * 1000;
            eventLogger(scriptName + ".secondaryBalanceBeforeLastSell: " + secondaryBalanceBeforeLastSell);
            eventLogger(scriptName + ".primaryBalanceBeforeLastSell: " + primaryBalanceBeforeLastSell);
            var secondaryBalanceOnePromile = secondaryBalanceBeforeLastSell / ((1 - feeTaker) * 1000);
            var primaryBalanceOnePromile = primaryBalanceBeforeLastSell / ((1 - feeTaker) * 1000);
            eventLogger(scriptName + ".secondaryBalanceOnePromile: " + secondaryBalanceOnePromile);
            eventLogger(scriptName + ".primaryBalanceOnePromile: " + primaryBalanceOnePromile);
            var newWantedSecondaryBalance = secondaryBalanceOnePromile * 1000 + secondaryBalanceOnePromile * feeMaker * 1000;
            var newWantedPrimaryBalance = primaryBalanceOnePromile * 1000 + primaryBalanceOnePromile * feeMaker * 1000;
            eventLogger(scriptName + ".newWantedSecondaryBalance: " + newWantedSecondaryBalance);
            eventLogger(scriptName + ".newWantedPrimaryBalance: " + newWantedPrimaryBalance);
            
            var lastCurrencyPrimaryBalance = trader.get("Balance", currencyPrimary);
            var lastPrice = trader.get("LastPrice");
            var buyAmount = lastCurrencyPrimaryBalance / lastPrice;
            buyAmount = buyAmount - 0.00001;
            eventLogger(scriptName + ".lastCurrencyPrimaryBalance: " + lastCurrencyPrimaryBalance);
            eventLogger(scriptName + ".lastPrice: " + lastPrice);
            eventLogger(scriptName + ".buyAmount: " + buyAmount);
            if(lastPrice < newWantedPrimaryBalance)
                trader.buy(currencySecondary + currencyPrimary, buyAmount, lastPrice);            
            else
                trader.buy(currencySecondary + currencyPrimary, buyAmount, newWantedPrimaryBalance);           
                
            resetSignalSellFilesStatus();
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
            eventLogger(scriptName + ".lastCurrencySecondaryBalance: " + lastCurrencySecondaryBalance);
            eventLogger(scriptName + ".lastSellPrice: " + lastSellPrice);
            if (lastSellPrice == 0) {
                lastSellPrice = trader.get("LastPrice");
            } else {
                lastSellPrice = trader.get("LastMySellPrice");
            }
            eventLogger(scriptName + ".lastSellPrice: " + lastSellPrice);            
            var primaryBalanceBeforeLastBuy = lastBuyPrice / ((1 - feeMaker) * 1000) * 1000;
            var secondaryBalanceBeforeLastBuy = lastCurrencySecondaryBalance / ((1 - feeMaker) * 1000) * 1000;
            eventLogger(scriptName + ".secondaryBalanceBeforeLastBuy: " + secondaryBalanceBeforeLastBuy);
            eventLogger(scriptName + ".primaryBalanceBeforeLastBuy: " + primaryBalanceBeforeLastBuy);            
            var secondaryBalanceOnePromile = secondaryBalanceBeforeLastBuy / ((1 - feeMaker) * 1000);
            var primaryBalanceOnePromile = primaryBalanceBeforeLastBuy / ((1 - feeMaker) * 1000);
            eventLogger(scriptName + ".secondaryBalanceOnePromile: " + secondaryBalanceOnePromile);
            eventLogger(scriptName + ".primaryBalanceOnePromile: " + primaryBalanceOnePromile);            
            var newWantedSecondaryBalance = secondaryBalanceOnePromile * 1000 + secondaryBalanceOnePromile * feeTaker * 1000;
            var newWantedPrimaryBalance = primaryBalanceOnePromile * 1000 + primaryBalanceOnePromile * feeTaker * 1000;
            eventLogger(scriptName + ".newWantedSecondaryBalance: " + newWantedSecondaryBalance);
            eventLogger(scriptName + ".newWantedPrimaryBalance: " + newWantedPrimaryBalance);
                        
            var lastCurrencySecondaryBalance = trader.get("Balance", currencySecondary);
            var lastPrice = trader.get("LastPrice");
            var sellAmount = lastCurrencySecondaryBalance;
            var sellPrice = newWantedPrimaryBalance;
            sellAmount = sellAmount - 0.00001;
            eventLogger(scriptName + ".lastCurrencySecondaryBalance: " + lastCurrencySecondaryBalance);
            eventLogger(scriptName + ".lastPrice: " + lastPrice);
            eventLogger(scriptName + ".sellAmount: " + sellAmount);
            eventLogger(scriptName + ".sellPrice: " + sellPrice);
            if(lastPrice > sellPrice)
                trader.sell(currencySecondary + currencyPrimary, sellAmount, lastPrice);            
            else
                trader.sell(currencySecondary + currencyPrimary, sellAmount, sellPrice);
            
            resetSignalBuyFilesStatus();
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
    eventLogger(scriptName + ".START");

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

    eventLogger(scriptName + ".END");
}

//////////////////////////////////////////////////////////////////////////////////////////////
///////////////                      main program                          ///////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

trader.timer(60, "startEverything()");