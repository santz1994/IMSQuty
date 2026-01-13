UPDATE users SET password='$2y$12$EMQKJSESztoA4/WBOybtnOZYGK4WDAgxA99eZhf.BNLJD7kFrUJZ2' WHERE email='daniel@quty.co.id';
SELECT email, substring(password, 1, 20) as pwd_preview FROM users WHERE email='daniel@quty.co.id';
