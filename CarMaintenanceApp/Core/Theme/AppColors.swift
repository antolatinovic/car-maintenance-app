import SwiftUI

/// Design System - Palette de couleurs
/// Reference: PRD Section 6.1
struct AppColors {
    // MARK: - Backgrounds
    static let backgroundPrimary = Color(hex: "#0D1117")      // Noir profond (plus sombre)
    static let backgroundSecondary = Color(hex: "#161B22")    // Cartes et surfaces
    static let backgroundTertiary = Color(hex: "#1C2128")     // Elements sureleves

    // MARK: - Card Backgrounds (avec teinte bleutee comme la maquette)
    static let cardBackground = Color(hex: "#1A1A2E")
    static let cardBackgroundLight = Color(hex: "#16213E")

    // MARK: - Text
    static let textPrimary = Color.white
    static let textSecondary = Color(hex: "#8B949E")
    static let textTertiary = Color(hex: "#6E7681")

    // MARK: - Accents
    static let accentPrimary = Color(hex: "#58A6FF")          // Bleu clair (cyan)
    static let accentSuccess = Color(hex: "#3FB950")          // Vert
    static let accentWarning = Color(hex: "#D29922")          // Orange/Jaune
    static let accentDanger = Color(hex: "#F85149")           // Rouge

    // MARK: - Gradients
    static let cardGradient = LinearGradient(
        colors: [Color(hex: "#1A1A2E"), Color(hex: "#16213E")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let vehicleCardGradient = LinearGradient(
        colors: [
            Color(hex: "#1A1A2E"),
            Color(hex: "#0F3460")
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let accentGradient = LinearGradient(
        colors: [Color(hex: "#58A6FF"), Color(hex: "#3FB950")],
        startPoint: .leading,
        endPoint: .trailing
    )

    // MARK: - Borders & Separators
    static let border = Color(hex: "#30363D")
    static let separator = Color(hex: "#21262D")

    // MARK: - Button States
    static let buttonPrimary = accentPrimary
    static let buttonSecondary = Color(hex: "#21262D")
    static let buttonDisabled = Color(hex: "#484F58")

    // MARK: - Status Colors
    static let statusOnline = accentSuccess
    static let statusOffline = Color(hex: "#6E7681")
    static let statusBusy = accentWarning
}

// MARK: - Color Extension for Hex Support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Preview
#Preview("Color Palette") {
    ScrollView {
        VStack(spacing: 20) {
            Group {
                Text("Backgrounds")
                    .font(.headline)
                    .foregroundColor(.white)
                HStack(spacing: 10) {
                    ColorSwatch(color: AppColors.backgroundPrimary, name: "Primary")
                    ColorSwatch(color: AppColors.backgroundSecondary, name: "Secondary")
                    ColorSwatch(color: AppColors.backgroundTertiary, name: "Tertiary")
                }
            }

            Group {
                Text("Accents")
                    .font(.headline)
                    .foregroundColor(.white)
                HStack(spacing: 10) {
                    ColorSwatch(color: AppColors.accentPrimary, name: "Primary")
                    ColorSwatch(color: AppColors.accentSuccess, name: "Success")
                    ColorSwatch(color: AppColors.accentWarning, name: "Warning")
                    ColorSwatch(color: AppColors.accentDanger, name: "Danger")
                }
            }
        }
        .padding()
    }
    .background(AppColors.backgroundPrimary)
}

private struct ColorSwatch: View {
    let color: Color
    let name: String

    var body: some View {
        VStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(color)
                .frame(width: 60, height: 60)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                )
            Text(name)
                .font(.caption2)
                .foregroundColor(.white)
        }
    }
}
