const postService = require('../services/postService');

module.exports = {
    /* ------- POST '/posting/lecture' 구인글 작성 ------- */
    createPost: async(req,res) => {
         try {
            // Request Body에서 객체 가져오기
            const post = req.body;
            console.log(post);
            const userId = req.userId;
            // 만약 가져오지 못했다면
            if(!post) {
                res.send(404).send({message: 'cannot get body....'})
            }
            // 객체 postService로 보내기(lecturePost 생성)
            const {type, message, postId} = await postService.createPost(userId, post);

            if (type === 'Error') {
                return res.status(500).json({type, message});
            }
            // 성공 시 lecturePost 의 id인 postId 보내기
            return res.status(200).json({type, message, postId});
            
         } catch (err) {
            return res.status(500).json(err);
         }
    },
    /* ------- POST '/posting/lecture' 구인글 작성 끝 ------- */
    /* ------- POST '/posting/lecture/apply' 지원하기 ------- */
    apply: async(req,res) => {
        try{
            const userId = req.userId;
            const postId = req.body.postId;
            const roleId = req.body.roleId;

            if(!postId || !roleId) {
                res.send(404).send({message: 'cannot get postId or roleId....'});
            }

            const {type, message, applierId} = await postService.apply(userId, postId, roleId);

            if (type === 'Error') {
                return res.status(500).json({type, message});
            }
            return res.status(200).json({type, message, userId, applierId});

        } catch (err) {
            return res.status(500).json(err);
        }
    },
    /* ------------ POST '/posting/lecture/apply' 지원하기 끝 ----------- */
    /* ---- GET '/posting/lecture?sort={option}&page={pageNum}' 구인글 리스트 조회 ----- */
    getAllPost: async(req,res) => {
        try {
            // 쿼리스트링에서 sort 옵션 가져오기
            const sort = req.query.sort;
            let page = req.query.page;
            const userId = req.userId;

            if(page == null) {
                page = 1;
            }

            console.log(req.query);
            if((!sort == null) && !(sort == 'latest') && !(sort == 'popular') && !(sort == 'level')) {
                return res.status(404).send({message: '그런 sort는 없습니다........'});
            }

            // postService로 보내기
            const data = await postService.findAllPosts(sort, page, userId);

            return res.status(200).json({
                ok:true,
                message:"모든 포스트 가져오기 성공!",
                data
            })
        } catch(err) {
            return res.status(500).json(err);
        }
    },
    /* ------------- GET '/posting/lecture?sort={option}' 구인글 리스트 조회 끝 -------------- */
    /* ---- GET '/posting/lecture/my?page={pageNum}' 작성한 구인글 상세조회 ---- */
    getMyPost: async(req,res) => {
        try {
            // 쿼리스트링에서 유저 id 가져오기
            const writer_id = req.userId;
            let page = req.query.page;
            if(page == null) {
                page = 1;
            }
            console.log("writerId : " + writer_id);
            // 쿼리스트링에서 sort 옵션 가져오기
            // const sort = req.query.sort;
            // console.log("sort : " + sort);
            // if((!sort == null) && !(sort === 'latest') && !(sort === 'popular')) {
            //    return  res.status(404).send({message: '그런 sort는 없습니다........'});
            // }

            // postService로 보내기
            const data = await postService.findMyPosts(writer_id, page);

            return res.status(200).json({
                ok:true,
                message:"유저가 작성한 포스트 가져오기 성공!",
                data
            })
        } catch(err) {
            return res.status(500).json(err);
        }

    },
    /* ---- GET '/posting/lecture?writerId={userId}&sort={option}' 작성한 구인글 상세조회 ---- */
    /* ---------------- GET '/posting/lecture/:postId' 구인글 상세 조회 ---------------------- */
    getPosting: async(req,res) => {

    },
    /* ------------------------------ GET '/posting/lecture/:postId' 구인글 상세 조회 끝 ------------------------------------- */
    /* GET '/posting/lecture/member?status={option} && writerId ={userId} && postId={postId}' 작성한 구인글 지원자 리스트 조회 */
    getAllAppliers: async(req,res) => {
        
    },
    /* GET '/posting/lecture/member?status={option} && writerId ={userId} && postId={postId}' 작성한 구인글 지원자 리스트 조회 끝 */
    /* ------------------- GET '/posting/lecture/apply?userId={userId}' 내가 작성한 구인글 리스트 조회 -------------------------- */
    getMyApplyPosting: async(req,res) => {

    },
    /* ------------------- GET '/posting/lecture/apply?userId={userId}' 내가 작성한 구인글 리스트 조회 끝 ------------------------ */
    /* -------------- PATCH '/posting/lecture/member?writerId ={userId} && postId={postId}' 구인글 지원상태 변경 ----------------- */
    updateApplyStatus: async(req,res) => {

    }
    /* -------------- PATCH '/posting/lecture/member?writerId ={userId} && postId={postId}' 구인글 지원상태 변경 끝 ----------------- */
}