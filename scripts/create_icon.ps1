# ============================================================================
# Mowajjih Multi-Resolution Windows Icon Generator
# ============================================================================

Add-Type -AssemblyName System.Drawing

$srcPng = "assets/icon.png"
if (-not (Test-Path $srcPng)) {
    Write-Error "assets/icon.png not found"
    exit 1
}

$masterBmp = [System.Drawing.Bitmap]::FromFile($srcPng)

# Standard Windows icon sizes (from 256 down to 16)
$sizes = @(256, 128, 64, 48, 32, 16)
$pngDataList = @()

foreach ($sz in $sizes) {
    $resized = New-Object System.Drawing.Bitmap $sz, $sz, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($masterBmp, 0, 0, $sz, $sz)
    $g.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $resized.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray()
    $ms.Dispose()
    $resized.Dispose()

    $pngDataList += ,@($sz, $bytes)
}
$masterBmp.Dispose()

# Build multi-icon ICO file
$icoFs = [System.IO.File]::Create("assets/icon.ico")
$bw = New-Object System.IO.BinaryWriter($icoFs)

$count = $sizes.Count
$bw.Write([uint16]0)      # Reserved
$bw.Write([uint16]1)      # Type 1 = Icon
$bw.Write([uint16]$count)  # Number of images

$offset = 6 + ($count * 16)

for ($i = 0; $i -lt $count; $i++) {
    $sz = $pngDataList[$i][0]
    $data = $pngDataList[$i][1]
    
    $wByte = if ($sz -ge 256) { [byte]0 } else { [byte]$sz }
    $hByte = if ($sz -ge 256) { [byte]0 } else { [byte]$sz }
    
    $bw.Write($wByte)
    $bw.Write($hByte)
    $bw.Write([byte]0)
    $bw.Write([byte]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]32)
    $bw.Write([uint32]$data.Length)
    $bw.Write([uint32]$offset)
    
    $offset += $data.Length
}

for ($i = 0; $i -lt $count; $i++) {
    $data = $pngDataList[$i][1]
    $bw.Write($data)
}

$bw.Flush()
$icoFs.Close()

Write-Host "SUCCESS: assets/icon.ico generated successfully with full multi-resolution support!"
