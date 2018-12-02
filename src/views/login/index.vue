<template>
  <div class="login-container">

    <el-form class="login-form" autoComplete="on" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left">

      <div class="title-container">
        <h3 class="title">{{$t('login.title')}}</h3>
        <lang-select class="set-language"></lang-select>
      </div>

      <el-form-item prop="username">
        <span class="svg-container svg-container_login">
          <svg-icon icon-class="peoples" />
        </span>
        <el-input @keyup.enter.native="inputEntered" name="username" type="text" v-model="loginForm.username" autoComplete="on" :placeholder="$t('login.username')"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container svg-container_login">
          <svg-icon icon-class="lock" />
        </span>
        <el-input name="password" @keyup.enter.native="inputEntered" :type="passwordType" v-model="loginForm.password" autoComplete="on"
                  :placeholder="$t('login.password')" />
        <span class="show-pwd" @click="showPwd">
          <svg-icon icon-class="eye" />
        </span>
      </el-form-item>

      <el-form-item prop="identifyCode">
        <span class="svg-container svg-container_login">
          <svg-icon icon-class="verifycode" />
        </span>
        <el-input class="identify-code" @keyup.enter.native="inputEntered" name="identifyCode" maxlength="4" type="text" v-model="loginForm.identifyCode" autoComplete="on" :placeholder="$t('login.verify')"
        />
        <div class="verify-code-div" @click="refreshCode">
          <SIdentify :identifyCode="identifyCode"></SIdentify>
        </div>
      </el-form-item>

      <el-button type="primary" style="width:100%;margin-bottom:30px;" :loading="loading" @click.native.prevent="handleLogin">{{$t('login.logIn')}}</el-button>

    </el-form>

    <!--<Copyright></Copyright>-->
  </div>
</template>

<script>
import { isvalidUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect'
import SIdentify from '@/components/SIdentify'
// import Copyright from '@/components/Copyright'

export default {
  components: { LangSelect, SIdentify },
  name: 'login',
  data () {
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('login.usernameEmpty')))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('login.passwordEmpty')))
      } else {
        callback()
      }
    }
    const validateIdentifyCode = (rule, value, callback) => {
      if (value !== this.identifyCode) {
        callback(new Error(this.$t('login.verifyCodeInvalid')))
      } else {
        callback()
      }
    }
    return {
      identifyCodes: '1234567890',
      identifyCode: '',
      loginForm: {
        gsdm: '',
        username: '',
        password: '',
        identifyCode: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        identifyCode: [{ required: true, trigger: 'blur', validator: validateIdentifyCode }]
      },
      passwordType: 'password',
      loading: false,
      showDialog: false
    }
  },
  methods: {
    inputEntered (event) {
      let curInputIndex = 0
      let curInputName = event.target.name
      if (curInputName === 'username') {
        if (!this.loginForm.username && this.loginForm.username === '') {
          this.$message({
            message: this.$t('login.usernameEmpty'),
            type: 'warning'
          })
          this.$refs.loginForm.$el[curInputIndex].focus()
          return
        }
      }
      if (curInputName === 'password') {
        curInputIndex = 1
        if (!this.loginForm.password && this.loginForm.password === '') {
          this.$message({
            message: this.$t('login.passwordEmpty'),
            type: 'warning'
          })
          this.$refs.loginForm.$el[curInputIndex].focus()
          return
        }
      }
      if (curInputName === 'identifyCode') {
        curInputIndex = 2
        if (!this.loginForm.identifyCode && this.loginForm.identifyCode === '') {
          this.$message({
            message: this.$t('login.verifyCodeEmpty'),
            type: 'warning'
          })
          this.$refs.loginForm.$el[curInputIndex].focus()
          return
        }
      }
      if (curInputIndex === 2) {
        this.handleLogin()
        return
      }
      this.$refs.loginForm.$el[curInputIndex + 1].focus()
    },
    showPwd () {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    handleLogin () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('LoginByUsername', this.loginForm).then(() => {
            console.log('success')
            this.loading = false
            this.$store.dispatch('setDefaultUsername', this.loginForm.username)
            this.$router.push({ path: '/' })
          }).catch(() => {
            console.log('error')
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    randomNum (min, max) {
      return Math.floor(Math.random() * (max - min) + min)
    },
    refreshCode () {
      this.identifyCode = ''
      this.makeCode(this.identifyCodes, 4)
    },
    makeCode (o, l) {
      for (let i = 0; i < l; i++) {
        this.identifyCode += this.identifyCodes[
          this.randomNum(0, this.identifyCodes.length)
        ]
      }
    }
  },
  mounted () {
    if (this.$store.getters.defaultUsername) {
      this.loginForm.username = this.$store.getters.defaultUsername
      this.$refs.loginForm.$el[1].focus()
      return
    }
    this.$refs.loginForm.$el[0].focus()
  },
  created () {
    this.refreshCode()
  },
  destroyed () {
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  /* 修复input 背景不协调 和光标变色 */
  /* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

  $bg:#283443;
  $light_gray:#eee;
  $cursor: #fff;

  @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
    .login-container .el-input input{
      color: $cursor;
      &::first-line {
        color: $light_gray;
      }
    }
  }

  /* reset element-ui css */
  .login-container {
    .el-input {
      display: inline-flex;
      height: 47px;
      width: 68%;
      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;
        &:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
          -webkit-text-fill-color: $cursor !important;
        }
      }
    }
    .el-form-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #454545;
    }
    .verify-code-div {
      display: inline-flex;
      height: 40px;
      vertical-align: middle;
    }
  }
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
  $bg:#2d3a4b;
  $dark_gray:#889aa4;
  $light_gray:#eee;

  .login-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: $bg;
    .login-form {
      position: absolute;
      left: 0;
      right: 0;
      width: 520px;
      padding: 35px 35px 15px 35px;
      margin: 120px auto;
    }
    .tips {
      font-size: 14px;
      color: #fff;
      margin-bottom: 10px;
      span {
        &:first-of-type {
          margin-right: 16px;
        }
      }
    }
    .svg-container {
      padding: 6px 5px 6px 15px;
      color: $dark_gray;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
      &_login {
        font-size: 20px;
      }
    }
    .title-container {
      position: relative;
      .title {
        font-size: 26px;
        color: $light_gray;
        margin: 0px auto 40px auto;
        text-align: center;
        font-weight: bold;
      }
      .set-language {
        color: #fff;
        position: absolute;
        top: 5px;
        right: 0px;
      }
    }
    .show-pwd {
      position: absolute;
      right: 10px;
      top: 7px;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }
    .thirdparty-button {
      position: absolute;
      right: 35px;
      bottom: 28px;
    }
  }
</style>
