import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import userRouter from './routes/user.js';
import questionRouter from './routes/question.js';
import answerRouter from './routes/answer.js';
import CustomError from './utils/customError.js';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1', userRouter);
app.use('/api/v1', questionRouter);
app.use('/api/v1', answerRouter);

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'production') {

    const __dirname = dirname(fileURLToPath(import.meta.url));
    app.use(express.static(path.join(__dirname, 'static')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'static/index.html'));
    });
}

app.get('/hello', (_, res) => res.status(200).send({ message: 'Hello there' }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, _) => {
    const custom = new CustomError(err.message);
    res.status(custom.statusCode).send({
        success: false,
        data: null,
        error: custom.message
    });
});


export default app;