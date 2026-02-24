
function Get-DocxText {
    param([string]$path)
    $tempDir = New-Item -ItemType Directory -Path (Join-Path $env:TEMP ([Guid]::NewGuid().ToString()))
    Expand-Archive -Path $path -DestinationPath $tempDir
    $xmlPath = Join-Path $tempDir "word\document.xml"
    if (Test-Path $xmlPath) {
        $xml = [xml](Get-Content $xmlPath)
        $text = $xml.document.body.InnerText
        $text
    }
    Remove-Item -Recurse -Force $tempDir
}

function Get-XlsxInfo {
    param([string]$path)
    $tempDir = New-Item -ItemType Directory -Path (Join-Path $env:TEMP ([Guid]::NewGuid().ToString()))
    Expand-Archive -Path $path -DestinationPath $tempDir
    
    # Check shared strings
    $ssPath = Join-Path $tempDir "xl\sharedStrings.xml"
    if (Test-Path $ssPath) {
        $xml = [xml](Get-Content $ssPath)
        Write-Host "--- Shared Strings ---"
        $xml.sst.si.t | ForEach-Object { $_ }
    }

    # Check sheet names
    $wbPath = Join-Path $tempDir "xl\workbook.xml"
    if (Test-Path $wbPath) {
        $xml = [xml](Get-Content $wbPath)
        Write-Host "--- Sheets ---"
        $xml.workbook.sheets.sheet | Select-Object name, sheetId
    }

    Remove-Item -Recurse -Force $tempDir
}

Write-Host "Analyzing 로가온_SCM_Cowork지시서.docx..."
Get-DocxText "로가온_SCM_Cowork지시서.docx"

Write-Host "`nAnalyzing 로가온_SCM_Cowork지시서_v2.docx..."
Get-DocxText "로가온_SCM_Cowork지시서_v2.docx"

Write-Host "`nAnalyzing 미니 사방넷 v.260219.xlsx..."
Get-XlsxInfo "미니 사방넷 v.260219.xlsx"
