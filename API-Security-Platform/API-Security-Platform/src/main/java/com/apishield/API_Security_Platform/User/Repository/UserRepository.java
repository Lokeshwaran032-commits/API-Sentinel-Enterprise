package com.apishield.API_Security_Platform.User.Repository;
import com.apishield.API_Security_Platform.User.Entity.user;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserRepository extends JpaRepository<user, Long> {
    Optional<user> findByEmail(String email);
}
