:help hit-enter

$fullPath1 = "C:\Users\Damjan\AppData\Roaming\Thunderbird\Profiles\0q4iknsd.default\Mail\Local Folders\tradersignal1-box"
$fullPath2 = "C:\Users\Damjan\AppData\Roaming\Thunderbird\Profiles\0q4iknsd.default\Mail\Local Folders\tradersignal2-box"
$fullPath3 = "C:\Users\Damjan\AppData\Roaming\Thunderbird\Profiles\0q4iknsd.default\Mail\Local Folders\tradersignal3-box"
$fullPath4 = "C:\Users\Damjan\AppData\Roaming\Thunderbird\Profiles\0q4iknsd.default\Mail\Local Folders\tradersignal4-box"
$fullPath6 = "C:\Users\Damjan\AppData\Roaming\Thunderbird\Profiles\0q4iknsd.default\Mail\Local Folders\tradersignal6-box"
$fullPath7 = "C:\Users\Damjan\AppData\Roaming\Thunderbird\Profiles\0q4iknsd.default\Mail\Local Folders\tradersignal7-box"
$copyToFolder = "C:\Users\Damjan\Documents\GitHub\qt-bitcoin-trader-scripts-signal-trading\BTC\"
$copyToFolder2 = "C:\Users\Damjan\Documents\GitHub\qt-bitcoin-trader-scripts-signal-trading\LTC\"
$copyToFolder3 = "C:\Users\Damjan\Documents\GitHub\qt-bitcoin-trader-scripts-signal-trading\ETH\"
$copyToFile1 = "Signal1Status.txt"
$copyToFile2 = "Signal2Status.txt"
$copyToFile3 = "Signal3Status.txt"
$copyToFile4 = "Signal4Status.txt"
$copyToFile6 = "Signal6Status.txt"
$copyToFile7 = "Signal7Status.txt"
$lastWrite1 = (get-item $fullPath1).LastWriteTime
$lastWrite2 = (get-item $fullPath2).LastWriteTime
$lastWrite3 = (get-item $fullPath3).LastWriteTime
$lastWrite4 = (get-item $fullPath4).LastWriteTime
$lastWrite6 = (get-item $fullPath6).LastWriteTime
$lastWrite7 = (get-item $fullPath7).LastWriteTime
$timespan = new-timespan -days 0 -hours 0 -minutes 5

if (((get-date) - $lastWrite1) -gt $timespan) {
    # older
    write-host "older 1"
    #Write-Output "FALSE" | Out-File -Encoding "UTF8"  ($copyToFolder + $copyToFile1)
} else {
    # newer
    write-host "changed 1"
    Write-Output "TRUE" | Out-File -Encoding "UTF8"  ($copyToFolder + $copyToFile1)
    
}


if (((get-date) - $lastWrite2) -gt $timespan) {
    # older
    write-host "older 2"
    #Write-Output "FALSE" | Out-File -Encoding "UTF8" ($copyToFolder + $copyToFile2)
} else {
    # newer
    write-host "changed 2"
	Write-Output "TRUE" | Out-File -Encoding "UTF8" ($copyToFolder + $copyToFile2)
}

if (((get-date) - $lastWrite3) -gt $timespan) {
    # older
    write-host "older 3"
    #Write-Output "FALSE" | Out-File -Encoding "UTF8" ($copyToFolder2 + $copyToFile3)
} else {
    # newer
    write-host "changed 3"
	Write-Output "TRUE" | Out-File -Encoding "UTF8" ($copyToFolder2 + $copyToFile3)
}

if (((get-date) - $lastWrite4) -gt $timespan) {
    # older
    write-host "older 4"
    #Write-Output "FALSE" | Out-File -Encoding "UTF8" ($copyToFolder2 + $copyToFile4)
} else {
    # newer
    write-host "changed 4"
	Write-Output "TRUE" | Out-File -Encoding "UTF8" ($copyToFolder2 + $copyToFile4)
}

if (((get-date) - $lastWrite6) -gt $timespan) {
    # older
    write-host "older 6"
    #Write-Output "FALSE" | Out-File -Encoding "UTF8" ($copyToFolder6 + $copyToFile6)
} else {
    # newer
    write-host "changed 6"
	Write-Output "TRUE" | Out-File -Encoding "UTF8" ($copyToFolder3 + $copyToFile6)
}

if (((get-date) - $lastWrite4) -gt $timespan) {
    # older
    write-host "older 7"
    #Write-Output "FALSE" | Out-File -Encoding "UTF8" ($copyToFolder7 + $copyToFile7)
} else {
    # newer
    write-host "changed 7"
	Write-Output "TRUE" | Out-File -Encoding "UTF8" ($copyToFolder3 + $copyToFile7)
}

exit