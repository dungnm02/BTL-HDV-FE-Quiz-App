package dungnm243.feapplication;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AppController {

    @GetMapping("")
    public String index() {
        return "index";
    }

    @GetMapping("/test/create")
    public String createTest() {
        return "test-create";
    }
}
