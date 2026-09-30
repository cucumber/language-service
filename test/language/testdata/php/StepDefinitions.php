<?php

namespace LanguageService;

use Behat\Step\Given;
use Behat\Step\Step;

class StepDefinitions
{
    /**
     * @Given ^a regexp$
     */
    public function regexp()
    {
        // Given
    }

    /**
     * @Given ^I test this change$
     */
    public function test_changes()
    {
        // Given
    }

    #[Given('^I use a short attribute$')]
    public function short_attribute()
    {
        // Given
    }

    #[\Behat\Step\Then('^I use a fully qualified attribute$')]
    public function fully_qualified_attribute()
    {
        // Then
    }

    #[Step('^I use a generic attribute$')]
    public function generic_attribute()
    {
        // Step
    }
}
