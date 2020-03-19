'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async index() {
    const { ctx } = this;
    const title = '用户列表';
    const users = await ctx.service.user.findAll();
    await ctx.render('user/index.ejs', {users: users, title})
  }
}

module.exports = UserController;
