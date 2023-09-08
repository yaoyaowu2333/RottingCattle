package com.example.demo.service;

import com.example.demo.domain.User;
import org.springframework.stereotype.Service;

@Service
public interface UserService {

    User findByOpenid(String openid);


    void insert(User user);

    void updateScore(User user);

}
