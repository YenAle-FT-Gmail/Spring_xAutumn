export function useToast() {
    return {
        toast: {
            success: (message: string) => {
                // Simple alert for now - can be replaced with proper toast later
                alert(`✅ ${message}`)
            },
            error: (message: string) => {
                alert(`❌ ${message}`)
            },
            info: (message: string) => {
                alert(`ℹ️ ${message}`)
            },
            warning: (message: string) => {
                alert(`⚠️ ${message}`)
            },
        },
    }
}