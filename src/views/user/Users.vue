<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" clearable @clear="getUserlist">
            <el-button slot="append" icon="el-icon-search" @click="getUserlist"></el-button>
          </el-input> 
        </el-col>
        <el-col :span="4">
          <el-button type="primary" size="small" @click="addDialogisVisibal=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#42B983"
              inactive-color="#ccc"
              @change="userStateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- edit -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialogForm(scope.row.id)"
            ></el-button>
            <!-- delete -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip effect="light" content="分配角色" placement="top" :enterable="false">
              <!-- setting -->
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="assignRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 3, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户产生的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogisVisibal"
      width="50%"
      @close="addDialogisClose"
    >
      <!-- 添加用户表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogisVisibal=false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
        @close="editDialogisClose"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="assigRoledialogVisible" width="50%" @close="assigRoledialogClose">
      <p>当前用户: {{userInfo.username}}</p>
      <p>当前角色: {{userInfo.role_name}}</p>
      <p>
        分配新角色:
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assigRoledialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // element ui中提供的表单自定义校验规则(因为缺少部分规则)
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表路由传递的参数
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 3
      },
      userList: [],
      total: 0,
      // dialog
      addDialogisVisibal: false,
      editDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {},
      // 添加用户规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 14, message: '长度在 6 到 14 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      assigRoledialogVisible: false,
      userInfo: {},
      roleList: [],
      selectedRoleId: ''
    }
  },

  methods: {
    // 用户列表请求
    async getUserlist() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      this.userList = res.data.users
      this.total = res.data.total
    },
    //分页功能
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserlist()
    },
    handleCurrentChange(newCurrentPage) {
      this.queryInfo.pagenum = newCurrentPage
      this.getUserlist()
    },
    // 用户状态改变
    async userStateChange(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      console.log(res)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 关闭添加用户表单
    addDialogisClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户时点击确定按钮
    addUser() {
      // 预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //调用接口
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        } else {
          this.$message.success('添加用户成功')
          this.addDialogisVisibal = false
          this.getUserlist()
        }
      })
    },
    // 获取修改用户信息
    async editDialogForm(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      } else {
        this.editForm = res.data
        this.editDialogVisible = true
      }
    },
    // 关闭编辑用户dialog
    editDialogisClose() {
      this.this.$refs.editFormRef.resetFields()
    },
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        } else {
          this.editDialogVisible = false
          this.getUserlist()
          this.$message.success('更新用户信息成功')
        }
      })
    },
    // 删除用户功能
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        // 调用删除用户接口
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.err('删除用户失败')
        } else {
          this.$message.success('删除用户成功')
          this.getUserlist()
        }
      }
    },
    // 分配角色
    async assignRole(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获角色列表失败')
      this.roleList = res.data
      // console.log(this.roleList)
      this.assigRoledialogVisible = true
    },
    // 点击分配角色确定按钮
    async saveRole() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择角色')
      } else {
        const { data: res } = await this.$http.put(
          `users/${this.userInfo.id}/role`,
          {
            rid: this.selectedRoleId
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('设置角色失败')
        } else {
          this.$message.success('分配角色成功')
          this.getUserlist()
          this.assigRoledialogVisible = false
        }
      }
    },
    // 关闭分配角色对话框
    assigRoledialogClose(){
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  },
  created() {
    this.getUserlist()
  }
}
</script>
<style lang="less" scoped>
.el-button {
  margin-top: 5px;
}
.el-table {
  margin-top: 20px;
  font-size: 14px;
}
.el-pagination {
  margin-top: 20px;
}
p {
  font-size: 16px;
}
</style>