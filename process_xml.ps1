
$doc1Xml = [xml](Get-Content 'temp_doc1/word/document.xml' -Raw)
$doc1Text = $doc1Xml.document.body.innerText
Write-Host "DOC1 CONTENT:"
$doc1Text

Write-Host "`n---`n"

$doc2Xml = [xml](Get-Content 'temp_doc2/word/document.xml' -Raw)
$doc2Text = $doc2Xml.document.body.innerText
Write-Host "DOC2 CONTENT:"
$doc2Text

Write-Host "`n---`n"

$ssXml = [xml](Get-Content 'temp_xlsx/xl/sharedStrings.xml' -Raw)
Write-Host "XLSX SHARED STRINGS:"
$ssXml.sst.si.t | ForEach-Object { $_ }
