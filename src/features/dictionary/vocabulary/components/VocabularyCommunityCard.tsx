import styles from "./VocabularyCommunityCard.module.css"

const COMMENTS = [
    {
        avatar: "🌸",
        name: "Sakura_chan",
        level: "N5",
        time: "2 ngày trước",
        content: "Từ này đi với する nghĩa là “học”. Rất dễ nhớ! 😊",
        likes: 128,
    },
    {
        avatar: "🧑‍🎓",
        name: "Minato",
        level: "N4",
        time: "5 ngày trước",
        content: "Hay đi với 一生懸命（いっしょうけんめい）nhé!",
        likes: 96,
    },
    {
        avatar: "🧑‍💻",
        name: "Yuki_1102",
        level: "N3",
        time: "1 tuần trước",
        content: "Mình thường dùng 勉強する mỗi ngày sau giờ làm việc.",
        likes: 74,
    },
]

export default function VocabularyCommunityCard() {
    return (
        <div
            className={`${styles.detailSideCard} ${styles.communityCard}`}
        >
            <h3>Ý KIẾN CỘNG ĐỒNG</h3>

            <div className={styles.communityInput}>
                🔍 Chia sẻ ý kiến của bạn về từ này...
            </div>

            <div className={styles.commentSort}>
                Sắp xếp: <strong>♡ Nhiều like nhất⌄</strong>
            </div>

            <div className={styles.commentList}>
                {COMMENTS.map((comment) => (
                    <div
                        key={comment.name}
                        className={styles.commentItem}
                    >
                        <div className={styles.commentAvatar}>
                            {comment.avatar}
                        </div>

                        <div className={styles.commentBody}>
                            <div className={styles.commentMeta}>
                                <strong>{comment.name}</strong>
                                <span>{comment.level}</span>
                                <small>{comment.time}</small>
                            </div>

                            <p>{comment.content}</p>

                            <div className={styles.commentActions}>
                                <button type="button">
                                    ♡ {comment.likes}
                                </button>
                                <button type="button">Trả lời</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" className={styles.allCommentButton}>
                Xem tất cả 28 bình luận →
            </button>
        </div>
    )
}
