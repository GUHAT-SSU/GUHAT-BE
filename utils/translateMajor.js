const translateMajor = (major) => {
    switch (major) {
        case "기독교학과":
            return "기독교";
        case "국어국문학과":
            return "국문";
        case "영여영문학과":
            return "영문";
        case "독어독문학과":
            return "독문";
        case "불어불문학과":
            return "불문";
        case "중어중문학과":
            return "중문";
        case "일어일문학과":
            return "일어일문";
        case "철학과":
            return "철학";
        case "예술창작학부 문예창작전공":
            return "문예창작전공";
        case "예술창작학부 영화예술전공":
            return "영화예술전공";
        case "스포츠학부":
            return "스포츠";
        case "수학과":
            return "수학";
        case "물리학과":
            return "물리";
        case "화학과":
            return "화학";
        case "정보통계보험수리학과":
            return "통계보험";
        case "의생명시스템학부":
            return "의생명";
        case "사회복지학부":
            return "사회복지";
        case "행정학부":
            return "행정";
        case "정치외교학과":
            return "정외";
        case "정보사회학과":
            return "정보사회";
        case "언론홍보학과":
            return "언론홍보";
        case "평생교육학과":
            return "평생교육";
        case "법학과":
            return "의생명";
        case "국제법무학과":
            return "의생명";
        case "경제학과":
            return "법학";
        case "글로벌통상학과":
            return "글로벌통상";
        case "경영학부":
            return "경영";
        case "회계학과":
            return "회계학과";
        case "금융학부":
            return "금융";
        case "화확공학과":
            return "화학";
        case "유기신소재파이버공학과":
            return "신소재";
        case "전기공학부":
            return "전기";
        case "산업정보시스템공학과":
            return "산업정보";
        case "건축학부":
            return "건축학부";
        case "컴퓨터학부":
            return "컴퓨터";
        case "전자정보공학부":
            return "전자공학";
        case "글로벌미디어학부":
            return "글로벌미디어";
        case "소프트웨어학부":
            return "소프트";
        case "AI 융학학부":
            return "AI융합";
        case "IT융합학과":
            return "IT융합";
        default:
            return major;
    }
};
module.exports = translateMajor;
