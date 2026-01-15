import SwiftUI

/// Container reutilisable pour les cartes avec style uniforme
struct CardContainer<Content: View>: View {
    let content: Content
    var backgroundColor: Color
    var cornerRadius: CGFloat
    var padding: CGFloat
    var hasShadow: Bool

    init(
        backgroundColor: Color = AppColors.backgroundSecondary,
        cornerRadius: CGFloat = AppDimensions.cornerRadiusM,
        padding: CGFloat = AppDimensions.cardPadding,
        hasShadow: Bool = true,
        @ViewBuilder content: () -> Content
    ) {
        self.backgroundColor = backgroundColor
        self.cornerRadius = cornerRadius
        self.padding = padding
        self.hasShadow = hasShadow
        self.content = content()
    }

    var body: some View {
        content
            .padding(padding)
            .background(backgroundColor)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .shadow(
                color: hasShadow ? .black.opacity(AppDimensions.cardShadowOpacity) : .clear,
                radius: hasShadow ? AppDimensions.cardShadowRadius : 0,
                x: 0,
                y: 2
            )
    }
}

/// Container avec gradient
struct GradientCardContainer<Content: View>: View {
    let content: Content
    var gradient: LinearGradient
    var cornerRadius: CGFloat
    var padding: CGFloat
    var hasShadow: Bool

    init(
        gradient: LinearGradient = AppColors.cardGradient,
        cornerRadius: CGFloat = AppDimensions.cornerRadiusXL,
        padding: CGFloat = AppDimensions.cardPadding,
        hasShadow: Bool = true,
        @ViewBuilder content: () -> Content
    ) {
        self.gradient = gradient
        self.cornerRadius = cornerRadius
        self.padding = padding
        self.hasShadow = hasShadow
        self.content = content()
    }

    var body: some View {
        content
            .padding(padding)
            .background(gradient)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .shadow(
                color: hasShadow ? .black.opacity(AppDimensions.cardShadowOpacity) : .clear,
                radius: hasShadow ? AppDimensions.cardShadowRadius : 0,
                x: 0,
                y: 4
            )
    }
}

// MARK: - View Modifier Alternative
struct CardStyle: ViewModifier {
    var backgroundColor: Color = AppColors.backgroundSecondary
    var cornerRadius: CGFloat = AppDimensions.cornerRadiusM
    var padding: CGFloat = AppDimensions.cardPadding
    var hasShadow: Bool = true

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(backgroundColor)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .shadow(
                color: hasShadow ? .black.opacity(AppDimensions.cardShadowOpacity) : .clear,
                radius: hasShadow ? AppDimensions.cardShadowRadius : 0,
                x: 0,
                y: 2
            )
    }
}

extension View {
    func cardStyle(
        backgroundColor: Color = AppColors.backgroundSecondary,
        cornerRadius: CGFloat = AppDimensions.cornerRadiusM,
        padding: CGFloat = AppDimensions.cardPadding,
        hasShadow: Bool = true
    ) -> some View {
        modifier(CardStyle(
            backgroundColor: backgroundColor,
            cornerRadius: cornerRadius,
            padding: padding,
            hasShadow: hasShadow
        ))
    }
}

// MARK: - Preview
#Preview("Card Containers") {
    ScrollView {
        VStack(spacing: 20) {
            CardContainer {
                VStack(alignment: .leading) {
                    Text("Standard Card")
                        .font(AppFonts.h3)
                        .foregroundColor(AppColors.textPrimary)
                    Text("Avec fond secondaire")
                        .font(AppFonts.caption)
                        .foregroundColor(AppColors.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            GradientCardContainer(gradient: AppColors.vehicleCardGradient) {
                VStack(alignment: .leading) {
                    Text("Gradient Card")
                        .font(AppFonts.h3)
                        .foregroundColor(AppColors.textPrimary)
                    Text("Avec gradient bleu")
                        .font(AppFonts.caption)
                        .foregroundColor(AppColors.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            Text("Using View Modifier")
                .font(AppFonts.body)
                .foregroundColor(AppColors.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .cardStyle()
        }
        .padding()
    }
    .background(AppColors.backgroundPrimary)
}
