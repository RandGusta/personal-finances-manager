package com.gustavo.finance.finance_control;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FinanceControlApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinanceControlApplication.class, args);
	}

}
