package it.akademija.kindergartenchoise;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface KindergartenChoiseDAO extends JpaRepository<KindergartenChoise, Long> {

	
	List<KindergartenChoise> deleteAllByKindergartenId(String kindergartenId);
	
}
