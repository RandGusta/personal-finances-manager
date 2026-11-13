package com.gustavo.finance.finance_control.repository;

import java.util.List;
import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.gustavo.finance.finance_control.entity.Category;
import com.gustavo.finance.finance_control.entity.Transaction;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.Wallet;

public interface TransactionRepository extends
    JpaRepository<Transaction, Long>,
    JpaSpecificationExecutor<Transaction> {
    
    List<Transaction> findBycreatedBy(User user);

    boolean existsByCategory(Category category);

    Optional<Transaction> findByIdAndWalletId(Long id, Long walletId);

    List<Transaction> findAllByWalletIdOrderByDateAsc(Long walletId);

    @Query("""
        select t from Transaction t
        where exists (
            select m.id from UserWallet m
            where m.wallet = t.wallet and m.user = :user
        )
        order by t.date asc, t.id asc
        """)
    List<Transaction> findAllAccessibleToUser(@Param("user") User user);

    List<Transaction> findAllByWalletIdAndDateBetweenOrderByDateAsc(
        Long walletId,
        LocalDate startDate,
        LocalDate endDate
    );

    List<Transaction> findAllByWalletIdAndDateGreaterThanEqualOrderByDateAsc(
        Long walletId,
        LocalDate startDate
    );

    List<Transaction> findAllByWalletIdAndDateLessThanEqualOrderByDateAsc(
        Long walletId,
        LocalDate endDate
    );

    void deleteAllByWallet(Wallet wallet);
}
