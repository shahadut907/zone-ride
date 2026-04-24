# Nuclear border removal script
# Replaces all borderWidth and borderColor on card/surface/container styles
# PRESERVES: text input focus state borders (AppTextInput.tsx) and divider lines

$srcDir = "e:\All create project\ZoneRide\src"

# Get all .tsx and .ts files (exclude AppTextInput.tsx - those are input focus borders we keep)
$files = Get-ChildItem -Path $srcDir -Recurse -Include "*.tsx","*.ts" | Where-Object {
    $_.Name -ne "AppTextInput.tsx" -and
    $_.Name -ne "glass.ts" -and
    $_.Name -ne "shadows.ts" -and
    $_.Name -ne "GlassCard.tsx"
}

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Pattern 1: borderWidth: Platform.OS === 'ios' ? 1 : 0,  -> borderWidth: 0,
    $content = $content -replace "borderWidth:\s*Platform\.OS\s*===\s*'ios'\s*\?\s*1\s*:\s*0", "borderWidth: 0"

    # Pattern 2: borderWidth: Platform.OS === 'ios' ? 1 : 0 (without trailing comma)
    # Already covered by pattern 1

    # Pattern 3: borderWidth: 1, (standalone border on cards) -> borderWidth: 0,
    # Be careful - only replace borderWidth: 1 or borderWidth: 2 on card containers
    # NOT in StatusStepper circles (those use 1.5)
    $content = $content -replace "borderWidth:\s*1,", "borderWidth: 0,"
    $content = $content -replace "borderWidth:\s*2,", "borderWidth: 0,"

    # Pattern 4: borderColor: Platform.OS === 'ios' ? colors.glassBorder : 'transparent',  -> borderColor: 'transparent',
    $content = $content -replace "borderColor:\s*Platform\.OS\s*===\s*'ios'\s*\?\s*colors\.glassBorder\s*:\s*'transparent'", "borderColor: 'transparent'"

    # Pattern 5: borderColor: Platform.OS === 'ios' ? glassValues.cardBorder : 'transparent',  -> borderColor: 'transparent',
    $content = $content -replace "borderColor:\s*Platform\.OS\s*===\s*'ios'\s*\?\s*glassValues\.cardBorder\s*:\s*'transparent'", "borderColor: 'transparent'"

    # Pattern 6: borderColor: Platform.OS === 'ios' ? glassValues.badgeBorder : 'transparent',  -> borderColor: 'transparent',
    $content = $content -replace "borderColor:\s*Platform\.OS\s*===\s*'ios'\s*\?\s*glassValues\.badgeBorder\s*:\s*'transparent'", "borderColor: 'transparent'"

    # Pattern 7: borderColor: colors.glassBorder, (standalone)  -> borderColor: 'transparent',
    $content = $content -replace "borderColor:\s*colors\.glassBorder,", "borderColor: 'transparent',"

    # Pattern 8: borderColor: 'rgba(255, 69, 58, 0.2)', -> borderColor: 'transparent',
    $content = $content -replace "borderColor:\s*'rgba\(255,\s*69,\s*58,\s*0\.2\)'", "borderColor: 'transparent'"

    # Pattern 9: borderColor: 'rgba(255, 159, 10, 0.25)', -> borderColor: 'transparent',
    $content = $content -replace "borderColor:\s*'rgba\(255,\s*159,\s*10,\s*0\.25\)'", "borderColor: 'transparent'"

    # Pattern 10: borderColor: colors.primaryLight, -> borderColor: 'transparent', (DeliveryRequestScreen input focus - keep only in AppTextInput)
    $content = $content -replace "borderColor:\s*colors\.primaryLight,", "borderColor: 'transparent',"

    # Pattern 11: borderColor: colors.primary, -> borderColor: 'transparent',
    $content = $content -replace "borderColor:\s*colors\.primary,", "borderColor: 'transparent',"

    # Pattern 12: RoleSelectionScreen dynamic borderColor in JSX: borderColor: `${accent}30`
    # This is inline styling, handled by borderWidth: 0

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "FIXED: $($file.FullName)"
    }
}

Write-Host "`nDone! All border styles have been nuked."
