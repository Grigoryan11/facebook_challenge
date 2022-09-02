export function userActivationTemplate(user, token) {
    return `<h2>Your account isn't active</h2><br><h3>Please click here for activating your account </h3> <h3><a href="${process.env.CLIENT_URL}/register/done-user/${user.id}/${token}">Activate account</a></h3>`;
}

export function sendPasswordReset(user) {
    return `<div>To reset your password please open the <a href="${process.env.CLIENT_URL}/reset-password/${user.id}/${user.emailCode}">link</a></div>`;
}