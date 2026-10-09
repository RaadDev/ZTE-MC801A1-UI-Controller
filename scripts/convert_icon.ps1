Add-Type -AssemblyName System.Drawing

$imgSrc = "C:\Users\OPN_I\.gemini\antigravity-ide\brain\ddca7126-1f69-44e9-8940-a98148864edb\zte_router_icon_1791548759115.jpg"

if (-not (Test-Path "assets")) {
    New-Item -ItemType Directory -Path "assets" | Out-Null
}

$bmp = [System.Drawing.Bitmap]::FromFile($imgSrc)

# Create 512x512 high res PNG
$target512 = New-Object System.Drawing.Bitmap 512, 512
$g512 = [System.Drawing.Graphics]::FromImage($target512)
$g512.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g512.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g512.DrawImage($bmp, 0, 0, 512, 512)
$g512.Dispose()

# Save assets/icon.png
$target512.Save("assets/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$target512.Dispose()

# Create 256x256 ICO
$target256 = New-Object System.Drawing.Bitmap 256, 256
$g256 = [System.Drawing.Graphics]::FromImage($target256)
$g256.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g256.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g256.DrawImage($bmp, 0, 0, 256, 256)
$g256.Dispose()
$bmp.Dispose()

$ms = New-Object System.IO.MemoryStream
$target256.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $ms.ToArray()
$ms.Dispose()
$target256.Dispose()

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

Write-Host "ICON GENERATION SUCCESSFUL!"
