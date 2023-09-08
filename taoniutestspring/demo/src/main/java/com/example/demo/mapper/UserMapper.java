package com.example.demo.mapper;

import com.example.demo.domain.User;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface UserMapper {


    /**
     * 根据微信的openid 查询用户
     * @param openid
     * @return
     */
    @Select("select * from taoniuuser where openid = #{openid}")
    User findByOpenid(String openid);

    @Insert("insert into taoniuuser values(null,#{nickName},#{avatarUrl},#{openid},#{topScore})")
    void insert(User user);

    @Update("update taoniuuser set topScore = #{topScore} where openid=#{openid} and #{topScore} > topScore")
    void updateScore(User user);


}
