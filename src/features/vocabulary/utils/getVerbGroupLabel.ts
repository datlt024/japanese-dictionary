export function getVerbGroupLabel(
    verbGroup: string | null
) {
    switch (verbGroup) {
        case "group_1":
            return "Động từ nhóm 1 - 五段動詞"

        case "group_2":
            return "Động từ nhóm 2 - 一段動詞"

        case "group_3":
            return "Động từ nhóm 3 - 不規則動詞"

        default:
            return null
    }
}