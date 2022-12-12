const { createBrowserFetcher } = require('puppeteer');
const lectureService = require('../services/lectureService');

module.exports = {
    createReview: async(req,res) => {
        try {
            const userId = req.userId;
            const lectureId = req.query.lectureId;
            if(!lectureId) {
                res.status(404).send({message: 'cannot get lectureId.........'});
            }
            const post = req.body;
            console.log(post);
            if(!post) {
                res.status(404).send({message: 'cannot get body........'});
            }
            const {type, message, reviewId} = await lectureService.createReview(userId, lectureId, post);

            if (type === 'Error') {
                return res.status(500).send({type, message});
            }

            return res.status(200).json({type, message, reviewId});

        } catch(err) {
            return res.status(500).json(err);
        }
    }
}