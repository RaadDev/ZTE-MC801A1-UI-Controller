Add-Type -AssemblyName System.Drawing

$imgSrc = "C:\Users\OPN_I\.gemini\antigravity-ide\brain\a8b1df58-8c0d-4338-b561-bfb56e2deae7\mowajjih_app_icon_1791200128473.jpg"
if (-not (Test-Path "assets")) {
    New-Item -ItemType Directory -Path "assets" | Out-Null
}

$bmp = [System.Drawing.Bitmap]::FromFile($imgSrc)
$targetBmp = New-Object System.Drawing.Bitmap 256, 256
$g = [System.Drawing.Graphics]::FromImage($targetBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.DrawImage($bmp, 0, 0, 256, 256)
$g.Dispose()
$bmp.Dispose()

$targetBmp.Save("assets/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

$ms = New-Object System.IO.MemoryStream
$targetBmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $ms.ToArray()
$ms.Dispose()
$targetBmp.Dispose()

$icoFs = [System.IO.File]::Create("assets/icon.ico")
$bw = New-Object System.IO.BinaryWriter($icoFs)
$bw.Write([uint16]0)
$bw.Write([uint16]1)
$bw.Write([uint16]1)

$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([byte]0)
$bw.Write([uint16]1)
$bw.Write([uint16]32)
$bw.Write([uint32]$pngBytes.Length)
$bw.Write([uint32]22)

$bw.Write($pngBytes)
$bw.Flush()
$icoFs.Close()

Write-Host "SUCCESS: assets/icon.png and assets/icon.ico generated successfully!"
