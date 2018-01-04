import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from "cors";

const app = express();
admin.initializeApp(functions.config().firebase);

/**
 * Validate http requests
 * @type {(req, res, next) => undefined}
 */
export const validateAuthToken = ((req, res, next) => {

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.status(403).send('Unauthorized');
        return;
    }

    let idToken;
    idToken = req.headers.authorization.split('Bearer ')[1];

    admin.auth().verifyIdToken(idToken).then(decodedIdToken => {
        req.user = decodedIdToken;
        next();
    }).catch(error => {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
    });

});

app.use(cors({origin: false}));
app.use(validateAuthToken);

app.get('/fetchMoleculeDetails', (req, res) => {
    res.send({});
});

exports.app = functions.https.onRequest(app);