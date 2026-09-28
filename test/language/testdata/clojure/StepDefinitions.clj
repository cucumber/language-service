(Given #"^a regexp$" []
  (println "done"))

(When #"^I test this change$" []
  (println "changed"))

(Then #"^something happened$" []
  (println "verified"))

(And #"^another thing$" []
  (println "also"))
