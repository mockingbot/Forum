import { call, put, take } from 'redux-saga/effects'
import * as Api from '../__api__'

import { replace } from 'react-router-redux'

// 1. 登录或注册
// 2. 根据当前user拿数据, 比如 我的帖子 粉丝等
// 3. 登出

function* signin (user) {
  try {
    const { email, authentication_token: token, msg } = yield call(Api.signin, user)
    if (token) {
      yield put({ type: 'signin:success', payload: { email, token } })
      return { email, token }
    } else {
      yield put({ type: 'signin:failed', payload: { error: msg } })
    }
  } catch (e) {
    yield put({ type: 'signin:failed', payload: { error: '???' } })
  }
}

function* signup (user) {
  try {
    const { email, token, msg } = yield call(Api.signup, user)
    if (token) {
      yield put({ type: 'signup:success', payload: { email, token } })
    } else {
      yield put({ type: 'signup:failed', payload: { error: msg } })
    }
  } catch (e) {
    yield put({ type: 'signup:failed', payload: { error: '???' } })
  }
}

function fromLocal () {
  const userId = localStorage.getItem('userId')
  const email = localStorage.getItem('email')
  const token = localStorage.getItem('token')
  if (userId && email && token) {
    return { userId, email, token }
  }
}

export default function* userSaga () {
  while (true) {
    console.log('启动user saga, 等待操作')
    const action = yield take([
      'auth:request',
      'signin:request',
      'signup:request'
    ])
    const { type, payload } = action
    let user
    switch (type) {
      case 'auth:request':
        console.log('从本地读取')
        user = yield call(fromLocal)
        break
      case 'signin:request':
        console.log('server登录')
        user = yield call(signin, payload.user)
        break
      case 'signup:request':
        console.log('server注册')
        user = yield call(signup, payload.user)
        break
    }
    if (user) {
      yield put({ type: 'auth:success', payload: { user } })
      console.log('认证成功')
      yield put(replace('/posts'))
      console.log('重定向到帖子列表页, 等待登出')
      yield take('signout:request')
    } else {
      console.log('认证失败')
    }
  }
}