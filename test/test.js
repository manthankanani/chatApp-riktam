const supertest = require('supertest');
const app = require('../app'); // Assuming your app is initialized in 'app.js'
const userController = require('../src/controllers/user');
const expect = require('chai').expect;



describe('Admin API', () => {
  let adminToken, adminId, userId, groupId, messageId;

  let admin = { username: 'Adminssss', password: 'passWord2', email: 'blablabla@email.com', is_admin: 1 };
  let user = { username: 'user123', password: 'passWord', email: 'username123@email.com', new_email: "username335@gmail.com", is_admin: 0};
  let group = { group_name: "Test Group"};
  let message = { content: "Hello World"};

  it('should create an admin', async () => {
    const response = await userController.createAdmin({body:{
      username: admin.username,
      password: admin.password,
      email: admin.email,
      is_admin: admin.is_admin
    }});
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('user');
    expect(response.body.user).to.have.property('user_id');
    adminId = response.body.user.user_id;
  });

  describe("User Case", async function () {
    before(async () => {
      const response = await supertest(app)
        .post('/api/auth/admin/login')
        .send({ username: admin.username, password: admin.password });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
      adminToken = response.body.token;
    });

    it('should create a new user', async () => {
      const response = await supertest(app)
        .post('/api/users/admin/users')
        .set('Authorization', adminToken)
        .send({
          username: user.username,
          password: user.password,
          email: user.email,
          is_admin: user.is_admin
        });
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('user_id');
      userId = response.body.user.user_id;
    });

    it('should edit user details', async () => {
      const response = await supertest(app)
        .put(`/api/users/admin/users/${userId}`)
        .set('Authorization', adminToken)
        .send({
          username: user.username,
          password: user.password,
          email: user.new_email,
          is_admin: 0
        });

      expect(response.status).to.equal(200);
    });

    describe("Group Case", async function () {
      before(async () => {
        const response = await supertest(app)
          .post('/api/auth/user/login')
          .send({ username: 'user', password: 'passWord' });
    
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('token');
        userToken = response.body.token;
      });

      it('should create a new group', async () => {
        const response = await supertest(app)
          .post('/api/groups/groups')
          .set('Authorization', userToken)
          .send({ group_name: group.group_name });
    
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('group');
        expect(response.body.group).to.have.property('group_id');
        groupId = response.body.group.group_id;
      });

      it('should add member to the group', async () => {
        const response = await supertest(app)
          .post(`/api/groups/groups/${groupId}/members`)
          .set('Authorization', userToken)
          .send({ userId: adminId });
    
        expect(response.status).to.equal(201);
      });

      it('should get members of the group', async () => {
        const response = await supertest(app)
          .get(`/api/groups/groups/${groupId}/members`)
          .set('Authorization', userToken)
    
        expect(response.status).to.equal(200);
      });

      it('should remove group member from the group', async () => {
        const response = await supertest(app)
          .delete(`/api/groups/groups/${groupId}/members/${adminId}`)
          .set('Authorization', userToken)

        expect(response.status).to.equal(200);
      });

      describe("Message Case", async function () {
        it('should send a message to the group', async () => {
          const response = await supertest(app)
            .post(`/api/groups/groups/${groupId}/messages`)
            .set('Authorization', userToken)
            .send({ messageContent: message.content });
      
          expect(response.status).to.equal(201);
          expect(response.body).to.have.property('sent_message');
          expect(response.body.sent_message).to.have.property('message_id');
          messageId = response.body.sent_message.message_id;
        });

        it('should like a message', async () => {
          const response = await supertest(app)
            .post(`/api/groups/groups/${groupId}/messages/${messageId}/like`)
            .set('Authorization', userToken)
      
          expect(response.status).to.equal(200);
        });

        it('should retrive message from group', async () => {
          const response = await supertest(app)
            .get(`/api/groups/groups/${groupId}/messages?cursor=`)
            .set('Authorization', userToken)
      
          expect(response.status).to.equal(200);
        });

        it('should delete group', async () => {
          const response = await supertest(app)
            .delete(`/api/groups/groups/${groupId}`)
            .set('Authorization', userToken)

          expect(response.status).to.equal(200);
        });

        it('should delete user', async () => {
          const response = await supertest(app)
            .delete(`/api/users/admin/users/${userId}`)
            .set('Authorization', adminToken)
            
          expect(response.status).to.equal(200);
        });

        it('should delete admin', async () => {
          const response = await supertest(app)
            .delete(`/api/users/admin/users/${adminId}`)
            .set('Authorization', adminToken)
            
          expect(response.status).to.equal(200);
        });

        it('should logout', async () => {
          const response = await supertest(app)
            .post(`/api/auth/logout`)
            .set('Authorization', adminToken)
          expect(response.status).to.equal(200);
        });
      });
    });
  });
});
