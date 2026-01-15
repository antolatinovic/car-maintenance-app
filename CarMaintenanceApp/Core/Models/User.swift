import Foundation

/// Modele utilisateur
struct User: Identifiable, Codable {
    let id: UUID
    var firstName: String
    var lastName: String
    var email: String?
    var avatarURL: String?

    var fullName: String {
        "\(firstName) \(lastName)"
    }

    var initials: String {
        let firstInitial = firstName.first.map { String($0) } ?? ""
        let lastInitial = lastName.first.map { String($0) } ?? ""
        return "\(firstInitial)\(lastInitial)".uppercased()
    }
}

// MARK: - Mock Data
extension User {
    static let mock = User(
        id: UUID(),
        firstName: "Jason",
        lastName: "Brooks",
        email: "jason.brooks@email.com",
        avatarURL: nil
    )

    static let mockWithAvatar = User(
        id: UUID(),
        firstName: "Marie",
        lastName: "Dupont",
        email: "marie.dupont@email.com",
        avatarURL: "https://example.com/avatar.jpg"
    )
}
