const postService = require("../services/postService");
const { findProfileByUserId } = require("../services/profileService");
const userService = require("../services/userService");

module.exports = {
    /* ------- POST '/posting/lecture' 구인글 작성 ------- */
    createPost: async (req, res) => {
        try {
            // Request Body에서 객체 가져오기
            const post = req.body;
            console.log(post);
            const userId = req.userId;
            // 만약 가져오지 못했다면
            if (!post) {
                res.status(404).send({ message: "cannot get body...." });
            }
            // 객체 postService로 보내기(lecturePost 생성)
            const { type, message, postId } = await postService.createPost(
                userId,
                post
            );

            if (type === "Error") {
                return res.status(500).json({ type, message });
            }
            // 성공 시 lecturePost 의 id인 postId 보내기
            return res.status(200).json({ type, message, postId });
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    /* ------- POST '/posting/lecture' 구인글 작성 끝 ------- */
    /* ------- POST '/posting/lecture/apply' 지원하기 ------- */
    apply: async (req, res) => {
        try {
            const userId = req.userId;
            const postId = req.body.postId;
            const roleId = req.body.roleId;

            if (!postId || !roleId) {
                res.send(404).send({
                    message: "cannot get postId or roleId....",
                });
            }

            const { type, message, applierId } = await postService.apply(
                userId,
                postId,
                roleId
            );

            if (type === "Error") {
                return res.status(500).json({ type, message });
            }
            return res.status(200).json({ type, message, userId, applierId });
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    /* ------------ POST '/posting/lecture/apply' 지원하기 끝 ----------- */
    /* ---- GET '/posting/lecture?sort={option}&page={pageNum}' 구인글 리스트 조회 ----- */
    getAllPost: async (req, res) => {
        try {
            // 쿼리스트링에서 sort 옵션 가져오기
            const sort = req.query.sort;
            let page = req.query.page;
            const userId = req.userId;

            if (page == null) {
                page = 1;
            }

            console.log(req.query);
            if (
                !sort == null &&
                !(sort == "latest") &&
                !(sort == "popular") &&
                !(sort == "level")
            ) {
                return res
                    .status(404)
                    .send({ message: "그런 sort는 없습니다........" });
            }

            // postService로 보내기
            const data = await postService.findAllPosts(sort, page, userId);

            return res.status(200).json({
                ok: true,
                message: "모든 포스트 가져오기 성공!",
                data,
            });
        } catch (err) {
            return res.status(500).json(err);
        }
    },
    /* ------------- GET '/posting/lecture?sort={option}' 구인글 리스트 조회 끝 -------------- */

    /* ---------------- GET '/posting/lecture/:postId' 구인글 상세 조회 ---------------------- */
    getPosting: async (req, res) => {
        try {
            // 쿼리스트링에서 sort 옵션 가져오기
            const userId = req.userId;
            const postId = req.params.postId;

            const data = await postService.getPost(postId);
            const writer = await userService.getUserInfo(data.writer_id);

            let isApply = "none";
            console.log(data);
            const Roles = [];
            for (let i = 0; i < data.Roles.length; i++) {
                const RoleAppliers = [];
                for (let j = 0; j < data.Roles[i].RoleAppliers.length; j++) {
                    const applier = data.Roles[i].RoleAppliers[j];
                    if (applier.dataValues.user_id === userId) {
                        isApply = applier.dataValues.status;
                    }
                    const user = await userService.getUserInfo(
                        applier.dataValues.user_id
                    );
                    const profile = await findProfileByUserId(user.id);
                    const applierInfo = {
                        ...applier.dataValues,
                        user,
                        profile: profile
                            ? {
                                  id: profile?.id,
                                  mode: profile?.mode,
                              }
                            : null,
                    };
                    RoleAppliers.push(applierInfo);
                }
                Roles.push({ ...data.Roles[i].dataValues, RoleAppliers });
            }

            return res.status(200).json({
                ok: true,
                message: "상세 조회 성공!",
                data: {
                    ...data,
                    Roles: Roles,
                    writer: writer,
                    isOwner: writer.id === userId,
                    isApply,
                },
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    /* ------------------------------ GET '/posting/lecture/:postId' 구인글 상세 조회 끝 ------------------------------------- */
    /* GET '/posting/lecture/member?status={option} && writerId ={userId} && postId={postId}' 작성한 구인글 지원자 리스트 조회 */
    getAllAppliers: async (req, res) => {},
    /* GET '/posting/lecture/member?status={option} && writerId ={userId} && postId={postId}' 작성한 구인글 지원자 리스트 조회 끝 */
    /* ------------------- GET '/posting/lecture/apply?userId={userId}' 내가 작성한 구인글 리스트 조회 -------------------------- */
    getMyApplyPosting: async (req, res) => {},
    /* ------------------- GET '/posting/lecture/apply?userId={userId}' 내가 작성한 구인글 리스트 조회 끝 ------------------------ */
    /* -------------- PATCH '/posting/lecture/member?writerId ={userId} && postId={postId}' 구인글 지원상태 변경 ----------------- */
    updateApplyStatus: async (req, res) => {
        try {
            const members = req.body.members;
            console.log("request MEmber", members);
            if (!members) {
                return res.status(400).json({
                    ok: false,
                    message: "잘못된 요청",
                });
            }

            for (let i = 0; i < members.length; i++) {
                const group = members[i];
                const applier = group.member.filter((v) => v !== null);
                console.log(group);
                await postService.updateMember(
                    group.roleId,
                    group.postId,
                    applier
                );
            }

            return res.status(200).json({
                ok: true,
                message: "팀원 변경 성공!",
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    /* -------------- GET 팀플 리뷰 리스트 전체 조회 ----------------- */
    getAllReview: async (req, res) => {
        try {
            const sort = req.query.sort;
            let page = req.query.page;
            if(page == null) {
                page = 1;
            }
            if (
                !sort == null &&
                !(sort == "latest") &&
                !(sort == "popular") &&
                !(sort == "level") &&
                !(sort == "like")
            ) {
                return res
                    .status(404)
                    .send({ message: "그런 sort는 없습니다........" });
            }
            const data = await postService.findAllReviews(
                req.userId,
                sort,
                page
            )

            return res.status(200).json({
                ok: true,
                message: "팀플 리뷰 리스트 전체 조회 성공!",
                data
            });
        } catch(err) {
            console.log(err);
            return res.status(500).json(err);
        }
    }
    /* -------------- POST'/posting/lecture/close? postId={postId}' 구인글 마감 ----------------- */
};
