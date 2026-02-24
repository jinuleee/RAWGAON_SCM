
$doc1 = [xml](Get-Content 'temp_doc1/word/document.xml' -Raw)
$text1 = $doc1.document.body.innerText
"DOC1:`n$text1" | Out-File 'requirements_summary.txt' -Encoding utf8

$doc2 = [xml](Get-Content 'temp_doc2/word/document.xml' -Raw)
$text2 = $doc2.document.body.innerText
"`n`nDOC2:`n$text2" | Out-File 'requirements_summary.txt' -Append -Encoding utf8

$ss = [xml](Get-Content 'temp_xlsx/xl/sharedStrings.xml' -Raw)
"`n`nXLSX SHARED STRINGS:" | Out-File 'requirements_summary.txt' -Append -Encoding utf8
$ss.sst.si | ForEach-Object { $_.t | Out-File 'requirements_summary.txt' -Append -Encoding utf8 }
