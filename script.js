document.addEventListener('DOMContentLoaded', () => {
    const fileSize = document.getElementById('fileSize');
    const fileSizeUnit = document.getElementById('fileSizeUnit');
    const downloadSpeed = document.getElementById('downloadSpeed');
    const speedUnit = document.getElementById('speedUnit');
    const timeDisplayFormat = document.getElementById('timeDisplayFormat');
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    const downloadTimeDefault = document.getElementById('downloadTimeDefault');
    const formatIndicator = document.getElementById('formatIndicator');
    
    function initDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'enabled' || 
            (localStorage.getItem('darkMode') === null && 
             window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'disabled');
        }
    }
    
    darkModeToggle.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'disabled');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'enabled');
        }
    });
    
    initDarkMode();
    
    const unitConversions = {
        b: 1/8,
        B: 1,
        Kb: 1000/8, 
        KB: 1000,
        Mb: 1000000/8,
        MB: 1000000,
        Gb: 1000000000/8,
        GB: 1000000000,
        Tb: 1000000000000/8,
        TB: 1000000000000,
        Pb: 1000000000000000/8,
        PB: 1000000000000000,
        Eb: 1000000000000000000/8,
        EB: 1000000000000000000,
        Zb: 1000000000000000000000/8,
        ZB: 1000000000000000000000,
        KiB: 1024,
        MiB: 1048576,
        GiB: 1073741824,
        TiB: 1099511627776,
        PiB: 1125899906842624,
        bps: 1/8,
        Bps: 1,
        Kbps: 1000/8,
        KBps: 1000,
        Mbps: 1000000/8,
        MBps: 1000000,
        Gbps: 1000000000/8,
        GBps: 1000000000,
        Tbps: 1000000000000/8,
        TBps: 1000000000000,
        KiBps: 1024,
        MiBps: 1048576,
        GiBps: 1073741824
    };

    function convertToBytes(value, unit) {
        return value * unitConversions[unit];
    }
    
    function setupNumericInput(inputElement) {
        inputElement.addEventListener('input', function() {
            let value = this.value.replace(/[^\d.,]/g, '');
            
            value = value.replace(/,/g, '.');
            
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            this.value = value;
            calculateDownloadTime();
        });
    }
    
    setupNumericInput(fileSize);
    setupNumericInput(downloadSpeed);
    
    function calculateDownloadTime() {
        const sizeInBytes = convertToBytes(parseFloat(fileSize.value) || 0, fileSizeUnit.value);
        const speedInBytesPerSecond = convertToBytes(parseFloat(downloadSpeed.value) || 1, speedUnit.value);
        
        if (speedInBytesPerSecond === 0) return;
        
        const totalSeconds = sizeInBytes / speedInBytesPerSecond;
        updateTimeDisplay(totalSeconds);
    }
    
    function updateFormatIndicator(format) {
        const formatLabels = {
            'default': 'Hours, Minutes, Seconds',
            'min_sec': 'Minutes and Seconds',
            'hour_per_min': 'Hours per Minute',
            'seconds': 'Seconds',
            'minutes': 'Minutes',
            'hours': 'Hours',
            'days': 'Days',
            'weeks': 'Weeks',
            'months': 'Months',
            'years': 'Years',
            'detailed': 'Detailed Breakdown'
        };
        
        formatIndicator.textContent = formatLabels[format] || formatLabels.default;
    }
    
    function updateTimeDisplay(totalSeconds) {
        if (isNaN(totalSeconds)) totalSeconds = 0;
        
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const days = Math.floor(totalSeconds / 86400);
        const weeks = Math.floor(totalSeconds / 604800);
        const months = Math.floor(totalSeconds / 2592000);
        const years = Math.floor(totalSeconds / 31536000);
        
        updateFormatIndicator(timeDisplayFormat.value);
        
        switch(timeDisplayFormat.value) {
            case 'seconds':
                downloadTimeDefault.textContent = `${totalSeconds.toFixed(2)}s`;
                break;
            case 'minutes':
                downloadTimeDefault.textContent = `${(totalSeconds / 60).toFixed(2)}m`;
                break;
            case 'hours':
                downloadTimeDefault.textContent = `${(totalSeconds / 3600).toFixed(2)}h`;
                break;
            case 'days':
                downloadTimeDefault.textContent = `${(totalSeconds / 86400).toFixed(2)}d`;
                break;
            case 'weeks':
                downloadTimeDefault.textContent = `${(totalSeconds / 604800).toFixed(2)}w`;
                break;
            case 'months':
                downloadTimeDefault.textContent = `${(totalSeconds / 2592000).toFixed(2)}mo`;
                break;
            case 'years':
                downloadTimeDefault.textContent = `${(totalSeconds / 31536000).toFixed(2)}y`;
                break;
            case 'min_sec':
                const totalMinutes = Math.floor(totalSeconds / 60);
                const remainingSeconds = Math.floor(totalSeconds % 60);
                downloadTimeDefault.textContent = `${totalMinutes}m ${remainingSeconds}s`;
                break;
            case 'hour_per_min':
                const hoursPerMinute = (totalSeconds / 3600) / (totalSeconds / 60);
                downloadTimeDefault.textContent = `${hoursPerMinute.toFixed(2)}h/min`;
                break;
            case 'detailed':
                const parts = [];
                if (years > 0) parts.push(`${years}y`);
                if (months % 12 > 0) parts.push(`${months % 12}mo`);
                if (days % 30 > 0) parts.push(`${days % 30}d`);
                if (hours > 0) parts.push(`${hours}h`);
                if (minutes > 0) parts.push(`${minutes}m`);
                if (seconds > 0 || parts.length === 0) parts.push(`${seconds.toFixed(2)}s`);
                downloadTimeDefault.textContent = parts.join(' ');
                break;
            default:
                const formattedHours = String(Math.floor(hours) + days * 24).padStart(2, '0');
                const formattedMinutes = String(Math.floor(minutes)).padStart(2, '0');
                const formattedSeconds = String(Math.floor(seconds)).padStart(2, '0');
                downloadTimeDefault.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        }
    }

    function handleUnitChange() {
        calculateDownloadTime();
    }

    fileSize.addEventListener('input', calculateDownloadTime);
    fileSizeUnit.addEventListener('change', handleUnitChange);
    downloadSpeed.addEventListener('input', calculateDownloadTime);
    speedUnit.addEventListener('change', handleUnitChange);
    timeDisplayFormat.addEventListener('change', calculateDownloadTime);
    
    updateFormatIndicator(timeDisplayFormat.value);
    calculateDownloadTime();
});