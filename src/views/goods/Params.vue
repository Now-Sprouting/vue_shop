<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意: 只允许为三级分类设置相关参数!" type="warning" :closable="false" show-icon></el-alert>
      <!-- 级联选择框 -->
      <el-row style="margin-bottom:10px">
        <el-col>
          <span class="span1">选择商品分类:</span>
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name' ,children:'children'}"
            @change="handleChange"
            clearable
            style="width:400px"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- Tabs标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisable"
            @click="addParamsDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 扩展空间 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环的tag标签 -->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入的tag标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <!-- 作用于插槽 -->
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="small"
                  @click="editDailogShow(scope.row.attr_id)"
                ></el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="small"
                  @click="deleteParams(scope.row.attr_id)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisable"
            @click="addParamsDialogVisible=true"
          >添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 扩展空间 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环的tag标签 -->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入的tag标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <!-- 作用于插槽 -->
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="editDailogShow(scope.row.attr_id)"
                  size="small"
                ></el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="small"
                  @click="deleteParams(scope.row.attr_id)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数和属性对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="addParamsDialogClose"
    >
      <el-form
        :model="addParamsForm"
        :rules="addParamsRules"
        ref="addParamsForm"
        label-width="120px"
      >
        <el-form-item :label="titleText+'名称'" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑按钮对话框 -->
    <el-dialog
      :title="'编辑'+titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      @close="editParamsDialogClose"
    >
      <el-form
        :model="editParamsForm"
        :rules="editParamsRules"
        ref="editParamsForm"
        label-width="120px"
      >
        <el-form-item :label="titleText+'名称'" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      //级联选择框选择的内容
      selectedKeys: [],
      activeName: 'many',
      //动态参数列表
      manyTableData: [],
      //静态属性列表
      onlyTableData: [],
      addParamsDialogVisible: false,
      addParamsForm: {
        attr_name: ''
      },
      addParamsRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      // 编辑对话框显示或隐藏属性
      editParamsDialogVisible: false,
      // 编辑对话框参数
      editParamsForm: {
        attr_name: ''
      },
      editParamsRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      //   编辑提交时需要的属性id
      attrId: ''
    }
  },
  methods: {
    async getCatelist() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取分类列表失败')
      } else {
        this.cateList = res.data
      }
    },
    // 获取商品参数
    async getParams() {
      // 要求选定为三级选择器
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        return
      }
      //请求动态参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品参数列表失败')
      }
      // 把商品参数的 item.attr_vals 由字符串转化为数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 单独添加每行的 输入tag标签,防止各行之间互相影响
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    handleChange() {
      this.manyTableData = []
      this.onlyTableData = []
      this.getParams()
    },
    handleTabsClick() {
      this.getParams()
      //   console.log(this.activeName)
    },
    addParamsDialogClose() {
      this.$refs.addParamsForm.resetFields()
    },
    // 添加参数或属性
    addParams() {
      this.$refs.addParamsForm.validate(async valid => {
        if (!valid) {
          return false
        } else {
          //   console.log(this.addParamsForm.attr_name)

          const { data: res } = await this.$http.post(
            `categories/${this.cateId}/attributes`,
            {
              attr_name: this.addParamsForm.attr_name,
              attr_sel: this.activeName
            }
          )
          if (res.meta.status !== 201) {
            this.$message.error('添加' + this.titleText + '失败')
          } else {
            this.$message.success('添加' + this.titleText + '成功')
            this.getParams()
            this.addParamsDialogVisible = false
          }
        }
      })
    },
    // 编辑参数或属性
    async editDailogShow(attrId) {
      this.attrId = attrId
      const {
        data: res
      } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        { params: { attr_sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        this.$message.error('获取修改数据失败')
      } else {
        this.editParamsForm.attr_name = res.data.attr_name
        this.editParamsDialogVisible = true
      }
    },
    editParamsDialogClose() {
      this.$refs.editParamsForm.resetFields()
      this.editParamsDialogVisible = false
    },
    // 提交编辑对话框
    editParams() {
      this.$refs.editParamsForm.validate(async valid => {
        if (!valid) {
          return false
        } else {
          const { data: res } = await this.$http.put(
            `categories/${this.cateId}/attributes/${this.attrId}`,
            {
              attr_name: this.editParamsForm.attr_name,
              attr_sel: this.activeName
            }
          )
          if (res.meta.status !== 200) {
            this.$message.error('编辑' + this.titleText + '失败')
          } else {
            this.$message.success('编辑' + this.titleText + '成功')
            this.getParams()
            this.editParamsDialogVisible = false
          }
        }
      })
    },
    // 删除属性或参数
    async deleteParams(attrId) {
      const confirmResult = await this.$confirm(
        '此操作将删除该' + this.titleText + ', 是否继续?',
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
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${attrId}`
        )
        if (res.meta.status !== 200) {
          return this.$message.err('删除' + this.titleText + '失败')
        } else {
          this.$message.success('删除' + this.titleText + '成功')
          this.getParams()
        }
      }
    },
    // 输入的tag标签 敲击Enter或者失去焦点
    async handleInputConfirm(row) {
      //  如果输入内容为空
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return false
      } else {
        // 如果输入内容非空,执行添加tag请求
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        // 需要发起请求，保存这次操作
        this.saveAttrVals(row)
      }
    },
    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrVals(row) {
      // 需要发起请求，保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功！')
    },
    // 点击输入的tag标签 按钮
    showInput(row) {
      row.inputVisible = true
      // 输入框自动获取焦点
      // $nextTick 当页面被重新渲染之后就会触发的动作
      // 如果直接写入下面的函数,就会报错
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数可选项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  created() {
    this.getCatelist()
  },
  computed: {
    isDisable() {
      if (this.selectedKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      } else {
        return null
      }
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-alert {
  margin: 5px 0 20px 0;
}
.span1 {
  margin-right: 20px;
}
.el-table {
  margin-top: 20px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>