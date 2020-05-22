<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" size="middle" @click="addDialogisVisibal=true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" style="width: 100%" stripe border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bottom-border',i1=== 0 ? 'top-border':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="deleteRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二,三级权限 -->
              <el-col :span="19" class="1">
                <!-- 二 -->
                <el-row
                  :class="[i2!==0?'top-border':'','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="deleteRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 三 -->
                    <el-tag
                      :class="i3!==0?'top-border':''"
                      v-for="(item3,i3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="deleteRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="360"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" width="360"></el-table-column>
        <el-table-column label="操作" width="360">
          <template slot-scope="scope">
            <!-- edit -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialogForm(scope.row.id)"
            >编辑</el-button>
            <!-- delete -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <!-- setting -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色产生的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogisVisibal" width="40%" @close="addFormClose">
      <!-- 添加角色表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogisVisibal=false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色信息产生的对话框 -->
    <el-dialog
      title="编辑角色信息"
      :visible.sync="editDialogisVisibal"
      width="40%"
      @close="editDialogClose"
    >
      <!-- 编辑角色表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogisVisibal=false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setFightDialogisVisibal"
      width="50%"
      @close="setFightDialogClose"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setFightDialogisVisibal=false">取 消</el-button>
        <el-button type="primary" @click="allotFights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>  

<script>
export default {
  data() {
    return {
      rolesList: [],
      addDialogisVisibal: false,
      addForm: {},
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      editDialogisVisibal: false,
      editForm: {},
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      setFightDialogisVisibal: false,
      rightsList: [],
      // 树形控件数据
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: [],
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      } else {
        this.rolesList = res.data
      }
    },
    addFormClose() {
      return this.$refs.addFormRef.resetFields()
    },
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //调用接口
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        } else {
          this.$message.success('添加用户成功')
          this.addDialogisVisibal = false
          this.getRolesList()
        }
      })
    },
    // 获取修改用户信息
    async editDialogForm(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      } else {
        this.editForm = res.data
        this.editDialogisVisibal = true
        console.log(this.editForm)
      }
    },
    editDialogClose() {
      return this.$refs.editFormRef.resetFields()
    },
    editRole() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色信息失败')
        } else {
          this.editDialogisVisibal = false
          this.getRolesList()
          this.$message.success('更新角色信息成功')
        }
      })
    },
    // 删除用户功能
    async removeRoleById(id) {
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
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.err('删除角色失败')
        } else {
          this.$message.success('删除角色成功')
          this.getRolesList()
        }
      }
    },
    // 删除用户权限
    async deleteRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status !== 200) {
          this.$message.error('删除角色权限失败')
        } else {
          this.$message.success('删除角色权限成功')
          role.children = res.data
        }
      }
    },
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return false
      } else {
        this.rightsList = res.data
        // console.log(this.rightsList)
      }
      this.getLeafKeys(role, this.defKeys)
      this.setFightDialogisVisibal = true
    },
    // 通过递归的形式,获取角色下所有三级权限的id,并保存到defKeys数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      } else {
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      }
    },
    setFightDialogClose() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotFights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const idKeys = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idKeys }
      )
      if (res.meta.status !== 200) {
        this.$message.error('分配权限失败')
      } else {
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setFightDialogisVisibal = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 20px;
}
.el-tag {
  margin: 10px;
}
.top-border {
  border-top: 1px solid #ccc;
}
.bottom-border {
  border-bottom: 1px solid #ccc;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>