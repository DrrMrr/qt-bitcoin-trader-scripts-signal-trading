:help hit-enter

$fullPath1 = "C:\Users\Damjan\AppData\Roaming\Thunderbird\Profiles\0q4iknsd.default\Mail\Local Folders\tradersignal1-box"
$fullPath2 = "C:\Users\Damjan\AppData\Roaming\Thunderbird\Profiles\0q4iknsd.default\Mail\Local Folders\tradersignal2-box"
$fullPath3 = "C:\Users\Damjan\AppData\Roaming\Thunderbird\Profiles\0q4iknsd.default\Mail\Local Folders\tradersignal3-box"
$fullPath4 = "C:\Users\Damjan\AppData\Roaming\Thunderbird\Profiles\0q4iknsd.default\Mail\Local Folders\tradersignal4-box"
$copyToFolder = "C:\Users\Damjan\Documents\GitHub\qt-bitcoin-trader-scripts-signal-trading\"
$copyToFile1 = "Signal1Status.txt"
$copyToFile2 = "Signal2Status.txt"
$copyToFile3 = "Signal3Status.txt"
$copyToFile4 = "Signal4Status.txt"
$lastWrite1 = (get-item $fullPath1).LastWriteTime
$lastWrite2 = (get-item $fullPath2).LastWriteTime
$lastWrite3 = (get-item $fullPath3).LastWriteTime
$lastWrite4 = (get-item $fullPath4).LastWriteTime
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
    #Write-Output "FALSE" | Out-File -Encoding "UTF8" -FilePath ($copyToFolder + $copyToFile3)
} else {
    # newer
    write-host "changed 3"
	Write-Output "TRUE" | Out-File -Encoding "UTF8" -FilePath ($copyToFolder + $copyToFile3)
}


if (((get-date) - $lastWrite4) -gt $timespan) {
    # older
    write-host "older 4"
    #Write-Output "FALSE" | Out-File -Encoding "UTF8" -FilePath ($copyToFolder + $copyToFile4)
} else {
    # newer
    write-host "changed 4"
	Write-Output "TRUE" | Out-File -Encoding "UTF8" -FilePath ($copyToFolder + $copyToFile4)
}

exit