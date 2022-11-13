import {GoogleOauth2} from "../model/authentication/GoogleOauth2";

const {OAuth2Client} = require('google-auth-library');
import config from "../config/config";
const client = new OAuth2Client(config.authentication.google.client_id);



export class GoogleLogin {

    async verify(token: string | undefined) {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: config.authentication.google.client_id
        });
        const payload = ticket.getPayload() as GoogleOauth2;
        if(payload.iss == 'https://accounts.google.com' || payload.iss == 'accounts.google.com') {
            if(payload.aud == config.authentication.google.client_id) {
                let secondsSinceEpoch = new Date().getTime() / 1000;
                if(payload.exp != undefined && payload.exp - secondsSinceEpoch > 0) {
                    return payload
                }
            }
        }
        return false
    }
}
