package com.gustavo.finance.finance_control.entity;
import java.time.LocalDateTime;

import org.hibernate.usertype.UserType;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import tools.jackson.databind.jsonFormatVisitors.JsonFormatTypes;

@Entity
@Data
public class UserWallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Wallet cannot be null")
    @ManyToOne
    private Wallet wallet;

    @NotNull(message = "User cannot be null")
    @ManyToOne
    private User user;

    @Enumerated(EnumType.STRING)
    private UserRelationWallet userRelationWallet;   

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime associationDate;

}
