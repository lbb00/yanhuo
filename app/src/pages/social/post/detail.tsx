import { View, Text, Image, Button, Input } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { useUserStore } from '../../../store/userStore'
import './detail.scss'

export default function PostDetail() {
  const router = useRouter()
  const { id } = router.params
  const { user, token } = useUserStore()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')

  const fetchPost = async () => {
    try {
      const res = await Taro.request({
        url: `http://localhost:3000/social/posts/${id}`,
        method: 'GET'
      })
      setPost(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await Taro.request({
        url: `http://localhost:3000/social/posts/${id}/comments`,
        method: 'GET'
      })
      setComments(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleComment = async () => {
    if (!newComment) return
    if (!user) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    try {
      await Taro.request({
        url: `http://localhost:3000/social/posts/${id}/comments`,
        method: 'POST',
        header: { 'Authorization': `Bearer ${token}` },
        data: { content: newComment }
      })
      setNewComment('')
      fetchComments()
      Taro.showToast({ title: '评论成功', icon: 'success' })
    } catch (err) {
      Taro.showToast({ title: '评论失败', icon: 'none' })
    }
  }

  useLoad(() => {
    if (id) {
      fetchPost()
      fetchComments()
    }
  })

  if (!post) return <View>Loading...</View>

  const images = JSON.parse(post.images || '[]')

  return (
    <View className='post-detail'>
      <View className='author'>
        <Text className='nickname'>{post.author?.nickname}</Text>
      </View>

      <Text className='content'>{post.content}</Text>

      <View className='images'>
        {images.map((img: string, i: number) => (
          <Image key={i} src={img} className='img' mode='widthFix' />
        ))}
      </View>

      <View className='comments-section'>
        <Text className='title'>评论 ({comments.length})</Text>
        {comments.map(c => (
          <View key={c.id} className='comment'>
            <Text className='user'>{c.author?.nickname}: </Text>
            <Text>{c.content}</Text>
          </View>
        ))}
      </View>

      <View className='comment-input'>
        <Input
          placeholder='说点什么...'
          value={newComment}
          onInput={e => setNewComment(e.detail.value)}
          confirmType='send'
          onConfirm={handleComment}
        />
        <Button size='mini' onClick={handleComment}>发送</Button>
      </View>
    </View>
  )
}

