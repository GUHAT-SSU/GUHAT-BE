module.exports = {
    myFindMajor: async (lecture) => {
        /* major 항목이 null -> elective / null이 아니면 -> major 를 반환 */
        console.log(lecture.univ);
        if(lecture.univ == "교양필수" || lecture.univ == "교양선택") {
            major = "elective" 
        } else {
            major = "major"
        }
        return major;
    },
    mySort: async (data_list, sort) => {
        return data_list.sort(function(a, b) {
            if(sort === "popular") { // 조회순
                if(a.viewCount > b.viewCount) {
                    return -1; 
                }
                else if(a.viewCount < b.viewCount) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
            else if(sort === "level") { // 레벨순
                if(a.writerLevel > b.writerLevel) {
                    return 1;
                }
                else if(a.writerLevel < b.writerLevel) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
            else { // sort === null 이면 최신순
                if(a.createdAt > b.createdAt) {
                    return -1;
                }
                else if(a.createdAt < b.createdAt) {
                    return 1;
                }
                else {
                    return 0;
                }   
            }
        })
    }
}