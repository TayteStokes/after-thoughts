import firestore from '../../../../lib/firebase-admin'

export default async (req, res) => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const { slug } = req.query

  // POST - Update view count for post
  if (req.method === 'POST' && !isDevelopment) {
    try {
      const postRef = firestore.collection('posts').doc(slug)
      const postDoc = await postRef.get()

      if (postDoc.exists) {
        const { views } = postDoc.data()

        await postRef.set(
          {
            views: views + 1,
          },
          { merge: true },
        )
      } else {
        await postRef.set({
          views: 1,
        })
      }

      return res.status(200).json({ error: false, message: 'View count updated!' })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }

  // GET - Get the view count for the post
  if (req.method === 'GET') {
    res.status(200).json({ name: 'John Doe' })
  }
}
