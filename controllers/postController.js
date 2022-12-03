postService = require('../controller/postService');

module.exports = {
    // POST '/posting/lecture' 구인글 작성
    postPosting: async(req,res) => {
         try {
            // Request Body에서 객체 가져오기
            const post = req.body;

            // 객체 postSercvice로 보내기(lecturePost 생성)

            // 성공 시 lecturePost 의 id인 postId 보내기
            
            
         } catch (err) {
            return res.status(400).send({
                ok: false,
                message: error.message,
            });
         }
    },
    // POST '/posting/lecture/apply' 지원하기
    postApply: async(req,res) => {

    },
    // GET '/posting/lecture?sort={option}' 구인글 리스트 조회
    getAllPosting: async(req,res) => {

    },
    // GET '/posting/lecture?writerId={userId}' 작성한 구인글 상세조회
    getMyPosting: async(req,res) => {

    },
    // GET '/posting/lecture/:postId' 구인글 상세 조회
    getPosting: async(req,res) => {

    },
    // GET '/posting/lecture/member?status={option} && writerId ={userId} && postId={postId}' 작성한 구인글 지원자 리스트 조회
    getAllAppliers: async(req,res) => {
        
    },
    // GET '/posting/lecture/apply?userId={userId}' 내가 작성한 구인글 리스트 조회
    getMyApplyPosting: async(req,res) => {

    },
    // PATCH '/posting/lecture/member?writerId ={userId} && postId={postId}' 구인글 지원상태 변경
    updateApplyStatus: async(req,res) => {

    }
}