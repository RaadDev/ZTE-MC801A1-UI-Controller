Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\OPN_I\.gemini\antigravity-ide\brain\ddca7126-1f69-44e9-8940-a98148864edb\zte_router_icon_hq_1791548939615.jpg"

if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found: $srcPath"
    exit 1
}

$origBmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $origBmp.Width
$h = $origBmp.Height

Write-Host "Source dimensions: $w x $h"

# Create a 32-bit ARGB bitmap
$argbBmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($argbBmp)
$g.DrawImage($origBmp, 0, 0, $w, $h)
$g.Dispose()
$origBmp.Dispose()

# Fast pixel array manipulation via LockBits
$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$bmpData = $argbBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$totalBytes = [Math]::Abs($bmpData.Stride) * $h
$bytes = New-Object byte[] $totalBytes
[System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $bytes, 0, $totalBytes)

# Breadth-first flood fill from 4 outer corners
$visited = New-Object 'bool[,]' $w, $h
$queue = New-Object 'System.Collections.Generic.Queue[System.Drawing.Point]'

$cornerPoints = @(
    (New-Object System.Drawing.Point 0, 0),
    (New-Object System.Drawing.Point ($w - 1), 0),
    (New-Object System.Drawing.Point 0, ($h - 1)),
    (New-Object System.Drawing.Point ($w - 1), ($h - 1))
)

function IsWhiteBackground($b, $g, $r) {
    # Check if pixel is white / very light background
    return ($r -gt 215 -and $g -gt 215 -and $b -gt 215)
}

foreach ($pt in $cornerPoints) {
    $idx = ($pt.Y * $bmpData.Stride) + ($pt.X * 4)
    $b = $bytes[$idx]
    $gCol = $bytes[$idx + 1]
    $r = $bytes[$idx + 2]
    if (IsWhiteBackground $b $gCol $r) {
        $queue.Enqueue($pt)
        $visited[$pt.X, $pt.Y] = $true
    }
}

$dx = @(0, 0, 1, -1)
$dy = @(1, -1, 0, 0)

$floodPixels = New-Object System.Collections.Generic.List[System.Drawing.Point]

while ($queue.Count -gt 0) {
    $curr = $queue.Dequeue()
    $floodPixels.Add($curr)
    
    for ($i = 0; $i -gt -5 -and $i -lt 4; $i++) {
        $nx = $curr.X + $dx[$i]
        $ny = $curr.Y + $dy[$i]
        
        if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h) {
            if (-not $visited[$nx, $ny]) {
                $visited[$nx, $ny] = $true
                $nIdx = ($ny * $bmpData.Stride) + ($nx * 4)
                $nB = $bytes[$nIdx]
                $nG = $bytes[$nIdx + 1]
                $nR = $bytes[$nIdx + 2]
                
                if (IsWhiteBackground $nB $nG $nR) {
                    $queue.Enqueue((New-Object System.Drawing.Point $nx, $ny))
                }
            }
        }
    }
}

Write-Host "Flooded transparent pixels: $($floodPixels.Count)"

# Set flooded pixels to transparent (Alpha = 0)
foreach ($pt in $floodPixels) {
    $idx = ($pt.Y * $bmpData.Stride) + ($pt.X * 4)
    $bytes[$idx + 3] = 0 # Alpha = 0
}

# Soft Edge Anti-aliasing (smooth border between squircle and transparent background)
foreach ($pt in $floodPixels) {
    for ($i = 0; $i -lt 4; $i++) {
        $nx = $pt.X + $dx[$i]
        $ny = $pt.Y + $dy[$i]
        if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h) {
            $nIdx = ($ny * $bmpData.Stride) + ($nx * 4)
            $alpha = $bytes[$nIdx + 3]
            if ($alpha -eq 255) {
                # Neighbor is solid inside the squircle
                $nbB = $bytes[$nIdx]
                $nbG = $bytes[$nIdx + 1]
                $nbR = $bytes[$nIdx + 2]
                if ($nbR -gt 190 -and $nbG -gt 190 -and $nbB -gt 190) {
                    $bytes[$nIdx + 3] = 120 # Feather edge
                }
            }
        }
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $bmpData.Scan0, $totalBytes)
$argbBmp.UnlockBits($bmpData)

# Create 512x512 High-Res PNG with transparency
$final512 = New-Object System.Drawing.Bitmap 512, 512, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gFinal = [System.Drawing.Graphics]::FromImage($final512)
$gFinal.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gFinal.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gFinal.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$gFinal.DrawImage($argbBmp, 0, 0, 512, 512)
$gFinal.Dispose()
$argbBmp.Dispose()

# Save assets/icon.png
$final512.Save("assets/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved assets/icon.png (Transparent 512x512 PNG)"

# Generate 256x256 ICO with transparency
$target256 = New-Object System.Drawing.Bitmap 256, 256, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g256 = [System.Drawing.Graphics]::FromImage($target256)
$g256.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g256.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g256.DrawImage($final512, 0, 0, 256, 256)
$g256.Dispose()
$final512.Dispose()

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

Write-Host "Saved assets/icon.ico (Windows Icon with transparency)"
