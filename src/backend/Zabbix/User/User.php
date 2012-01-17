<?php
namespace Zabbix\User;

use Zabbix\Util\Deserializable,
	Zabbix\Util\Serializable,
	Zabbix\Util\BaseEntity;

/**
 * This entity represents a zabbix user.
 * 
 * @Entity
 * @Table(name="users")
 */
class User extends BaseEntity /*implements Serializable, Deserializable*/ {
	/** 
	 * The unique user id within the system.
	 * 
	 * @todo This is a bigint value; stored as string. Probably this can be changed to something better.
	 * 
	 * @Column(type="bigint")
	 * @Id
	 * @var string
	 */
	private $userid;
	
	/**
	 * The alias (or username) used to login.
	 * 
	 * @Column(type="string",length=100)
	 * @var string
	 */
	private $alias;
	
	/** 
	 * The name (or last name) of the user
	 * @Column(type="string",length=100)
	 */
	private $name;
	
	/**
	 * The surname (or first name) of the user
	 * @Column(type="string",length=100)
	 */
	private $surname;
	
	/**
	 * The password of the user
	 * @Column(type="string",length=32)
	 */
	private $passwd;
	
	/**
	 * Specifies the URL to which the frontend should redirect after login. This is only used
	 * for the classic frontend.
	 * 
	 * @Column(type="string",length=255)
	 * @var unknown_type
	 */
	private $url;
	
	/**
	 * Specifies if the user should be logged in automatically
	 * @var unknown_type
	 */
	private $autologin;
	/**
	 * 
	 * @todo Unknown variable. Find out what it does
	 * 
	 * @var unknown_type
	 */
	private $autologout;
}