package com.example.demo.controller;

import com.alibaba.fastjson.JSONObject;
import com.example.demo.domain.User;
import com.example.demo.help.HttpRequestHelp;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpSession;
//CrossOrigin跨域问题
@CrossOrigin
@RestController
public class UserController {

    private static final String WX_APPID = "wx4e5d521456e702b8";
    private static final String WX_SECRET = "ad5df83b40d8e9657b385ca7ef551a7b";
    private static final String WX_URL = "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code";

    @Autowired
    private UserService userService;

    @RequestMapping(value = "/login",method = RequestMethod.POST)
    public Object login(String code,String nickName,String avatarUrl) {
        // 拼接微信api请求地址
        String url = String.format(WX_URL,WX_APPID,WX_SECRET,code);
        JSONObject jsonObject = HttpRequestHelp.httpGet(url);
        String openid = jsonObject.getString("openid");
        // 根据获取的微信openid 去判断，判断是否已经存在
        User user = userService.findByOpenid(openid);
        if (user == null) {
            // 新增一个用户
            user = new User();
            user.setNickName(nickName);
            user.setAvatarUrl(avatarUrl);
            user.setOpenid(openid);
            user.setTopScore(0);
            userService.insert(user);
        }
        return "success";
    }



    @RequestMapping(value = "/updateScore",method = RequestMethod.POST)
    public Object updateScore(String code,int score) {//用code是为了避免SQL注入
        // 通过code换openid
        String openid = code2Openid(code);
        User user = userService.findByOpenid(openid);
        if (user == null) {
            return "error";
        }
        user.setTopScore(score);
        userService.updateScore(user);
        return "success";
    }


    private String code2Openid(String code) {
        String url = String.format(WX_URL,WX_APPID,WX_SECRET,code);
        JSONObject jsonObject = HttpRequestHelp.httpGet(url);
        String openid = jsonObject.getString("openid");
        return openid;
    }

    public static void main(String[] args) {
        String url = String.format(WX_URL,WX_APPID,WX_SECRET,"xx");
        JSONObject jsonObject = HttpRequestHelp.httpGet(url);
        System.out.println(jsonObject.toJSONString());
    }



}
