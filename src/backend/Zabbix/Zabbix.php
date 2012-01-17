<?php
namespace Zabbix;

use Doctrine\Common\ClassLoader,
    Doctrine\ORM\Configuration,
    Doctrine\ORM\EntityManager,
    de\RaumZeitLabor\PartKeepr\Util\Configuration as PartKeeprConfiguration;



class Zabbix {
	/**
	 * Initializes a zabbix frontend instance.
	 * 
	 * You *need* to call this method before doing anything else.
	 *
	 * An environment is used to load a different configuration file.
	 * Usually, you don't need to pass anything here.
	 *
	 * @param $environment	string	The environment to use, null otherwise.
	 * @return nothing
	 */
	public static function initialize ($environment = null) {
		self::initializeClassLoaders();
		self::initializeConfig($environment);
		/*
		self::initializeDoctrine();*/
	}
	
	/**
	 * Initializes the configuration for a given environment.
	 *
	 * An environment is used to load a different configuration file.
	 *
	 * Usually, you don't need to pass anything here.
	 *
	 *
	 * @param $environment	string	The environment to use, null otherwise.
	 * @return nothing
	 */
	public static function initializeConfig ($environment = null) {
		if ($environment != null) {
			include(dirname(dirname(dirname(__DIR__)))."/config-$environment.php");
		} else {
			include(dirname(dirname(dirname(__DIR__)))."/config.php");
		}
	
	}
	
	/**
	 * Initializes the doctrine class loader and sets up the
	 * directories.
	 *
	 * @param none
	 * @return nothing
	 */
	public static function initializeClassLoaders() {
		require_once 'Doctrine/Common/ClassLoader.php';
	
		$classLoader = new ClassLoader('Zabbix', dirname(__DIR__));
		$classLoader->register();
	
		$classLoader = new ClassLoader('Doctrine\ORM');
		$classLoader->register();
	
		$classLoader = new ClassLoader('Doctrine\DBAL');
		$classLoader->register();
	
		$classLoader = new ClassLoader('Doctrine\Common');
		$classLoader->register();
	
		$classLoader = new ClassLoader('Symfony', 'Doctrine');
		$classLoader->register();
	}
}